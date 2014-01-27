define([
    "ace",
    "theme/textmate",
    "text!templates/file.html",
    "less!stylesheets/file.less",
], function(ace, aceDefaultTheme, templateFile) {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var Dialogs = codebox.require("utils/dialogs");
    var FilesTabView = codebox.require("views/files/tab");
    var FileSync = codebox.require("utils/filesync");
    var user = codebox.require("core/user");
    var menu = codebox.require("core/commands/menu");
    var settings = codebox.require("core/settings");
    var Command = codebox.require("models/command");
    var themes = codebox.require("core/themes");
    var box = codebox.require("core/box");

    var logging = hr.Logger.addNamespace("editor");
    var userSettings = user.settings("editor");

    // Import ace
    var aceRange =  ace.require("ace/range");
    var aceModes = ace.require("ace/ext/modelist");
    var aceLangs = ace.require("ace/ext/language_tools");
    var aceWhitespace = ace.require("ace/ext/whitespace");


    var FileEditorView = FilesTabView.extend({
        className: "addon-files-aceeditor",
        templateLoader: "text",
        template: templateFile,
        defaults: {},
        events: {},
        shortcuts: {
            "mod+s": "saveFile",
            "mod+r": "runFile",
            "mod+f": "searchInFile"
        },

        // Constructor
        initialize: function() {
            var that = this;
            FileEditorView.__super__.initialize.apply(this, arguments);

            // Syntax menu command
            var syntaxMenu = new Command({}, {
                'title': "Syntax",
                'type': "menu"
            });
            syntaxMenu.menu.add(_.map(aceModes.modesByName, function(mode, name) {
                return {
                    'title': mode.caption,
                    'action': function() {
                        that.setMode(name);
                    }
                }
            }));

            // Collaborators
            this.collaboratorsMenu = new Command({}, {
                'title': "Collaborators",
                'type': "menu",
                'flags': "disabled"
            });

            // Tab menu
            this.tab.menu.menuSection([
                {
                    'type': "action",
                    'title': "Save",
                    'shortcuts': [
                        "mod+s"
                    ],
                    'bindKeyboard': false,
                    'action': function() {
                        that.sync.save();
                    }
                },
                {
                    'type': "action",
                    'title': "Run File",
                    'shortcuts': [
                        "mod+r"
                    ],
                    'flags': this.model.isNewfile() ? "disabled": "",
                    'bindKeyboard': false,
                    'action': function() {
                        that.model.run();
                    }
                }
            ]).menuSection([
                {
                    'type': "checkbox",
                    'title': "Toggle Collaboration Mode",
                    'flags': this.model.isNewfile() ? "hidden": "",
                    'offline': false,
                    'action': function(state) {
                        that.collaboratorsMenu.toggleFlag("disabled", !state);
                        that.sync.updateEnv({
                            'sync': state
                        });
                    }
                },
                syntaxMenu
            ]).menuSection([
                {
                    'title': "Convert Indentation to Spaces",
                    'action': function() {
                        that.convertIndentation(" ", userSettings.get("tabsize", 4));
                    }
                },
                {
                    'title': "Convert Indentation to Tabs",
                    'action': function() {
                        that.convertIndentation("\t", 1);
                    }
                }
            ]).menuSection([
                this.collaboratorsMenu
            ]).menuSection([{
                'type': "action",
                'title': "Settings",
                'offline': false,
                'action': function() {
                    settings.open("editor");
                }
            }]);

            // Create sync
            this.sync = new FileSync();

            // Create base ace editor instance
            this.$editor = $("<div>", {
                'class': "editor-ace"
            });
            this.editor = ace.edit(this.$editor.get(0));
            this.editor.session.setUseWorker(true);
            this.setOptions();
            this.markersS = {};
            this.markersC = {};
            this._op_set = false;

            // Configure editor
            this.editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true
            });

            // Bind settings changement
            userSettings.change(function() {
                var ops = _.extend({}, {
                    "mode": this.options.mode,
                    "readonly": this.options.readonly
                });
                this.setOptions(ops);
            }, this);

            // Bind editor changement -> sync
            this.editor.getSession().selection.on('changeSelection', function(){
                var selection = that.editor.getSelectionRange();
                that.sync.updateUserSelection(selection.start.column, selection.start.row, selection.end.column, selection.end.row);
            });
            this.editor.getSession().selection.on('changeCursor', function(){
                var cursor = that.editor.getSession().getSelection().getCursor();
                that.sync.updateUserCursor(cursor.column, cursor.row);
            });
            this.editor.getSession().doc.on('change', function(d) {
                if (that._op_set) return;
                that.sync.updateContent(that.editor.session.getValue());
            });

            // Bind sync -> editor
            this.sync.on("file:mode", function(mode) {
                this.setMode(mode)
            }, this);
            this.sync.on("content", function(content, oldcontent, patches) {
                var selection, cursor_lead, cursor_anchor, scroll_y;

                // Do some operations on selection to preserve selection
                selection = this.editor.getSession().getSelection();

                scroll_y = this.editor.getSession().getScrollTop();

                cursor_lead = selection.getSelectionLead();
                cursor_lead = this.sync.cursorPatch({
                    x: cursor_lead.column,
                    y: cursor_lead.row
                }, patches, oldcontent);

                cursor_anchor = selection.getSelectionAnchor();
                cursor_anchor = this.sync.cursorPatch({
                    x: cursor_anchor.column,
                    y: cursor_anchor.row
                }, patches, oldcontent);

                // Set editor content
                this._op_set = true;
                this.editor.session.setValue(content);
                this._op_set = false;

                // Move cursors
                this.editor.getSession().setScrollTop(scroll_y);

                cursor_anchor = this.sync.cursorPosByindex(cursor_anchor, content);
                this.editor.getSession().getSelection().setSelectionAnchor(cursor_anchor.y, cursor_anchor.x);

                cursor_lead = this.sync.cursorPosByindex(cursor_lead, content);
                this.editor.getSession().getSelection().selectTo(cursor_lead.y, cursor_lead.x);
            }, this);
            this.sync.on("cursor:move", function(cId, c) {
                var range = new aceRange.Range(c.y, c.x, c.y, c.x+1);
                if (this.markersC[cId]) this.editor.getSession().removeMarker(this.markersC[cId]);
                this.markersC[cId] = this.editor.getSession().addMarker(range, "marker-cursor marker-"+c.color.replace("#", ""), "text", true);
            }, this);
            this.sync.on("selection:move", function(cId, c) {
                var range = new aceRange.Range(c.start.y, c.start.x, c.end.y, c.end.x);
                if (this.markersS[cId]) this.editor.getSession().removeMarker(this.markersS[cId]);
                this.markersS[cId] = this.editor.getSession().addMarker(range, "marker-selection marker-"+c.color.replace("#", ""), "line", false);
            }, this);
            this.sync.on("cursor:remove selection:remove", function(cId) {
                this.editor.getSession().removeMarker(cId);
            }, this);
            this.sync.on("participants", function() {
                this.collaboratorsMenu.set("label", _.size(this.sync.participants));
                this.collaboratorsMenu.menu.reset(_.map(this.sync.participants, function(participant) {
                    return {
                        'type': "action",
                        'title': participant.user.get("name"),
                        'action': function() {
                            that.editor.getSession().getSelection().setSelectionAnchor(participant.cursor.y, participant.cursor.x);
                            that.editor.getSession().getSelection().selectTo(participant.cursor.y, participant.cursor.x);
                            that.editor.focus();
                        }
                    }
                }));
            }, this);

            // Commands
            this.editor.commands.addCommand({
                name: 'save',
                readOnly: true,
                bindKey: {
                    win: 'Ctrl-S',
                    mac: 'Command-S'
                },
                exec: _.bind(function(editor) {
                    this.saveFile();
                }, this)
            });
            this.editor.commands.addCommand({
                name: 'run',
                readOnly: true,
                bindKey: {
                    win: 'Ctrl-R',
                    mac: 'Command-R'
                },
                exec: _.bind(function(editor) {
                    this.runFile();
                }, this)
            });

            // Parent tab
            this.tab.on("tab:layout", function() {
                this.editor.resize();
            }, this);
            this.tab.on("tab:state", function(state) {
                if (state) this.focus();
            }, this);
            this.tab.on("tab:close", function() {
                this.sync.close();
                this.off();
            }, this);

            // Bind editor sync state changements
            this.sync.on("sync:state", function(state) {
                this.editor.setReadOnly(!state);
                if (!state) {
                    this.tab.setTabState("warning", true);
                } else {
                    this.tab.setTabState("warning", false);
                }
            }, this);
            this.sync.on("mode", function(mode) {
                this.tab.setTabState("sync", mode == this.sync.modes.SYNC);
            }, this);

            this.sync.on("sync:modified", function(state) {
                this.tab.setTabState("modified", state);
            }, this);

            this.sync.on("sync:loading", function(state) {
                this.tab.setTabState("loading", state);
            }, this);

            // Define file for code editor
            this.sync.setFile(this.model, {
                'sync': this.options.edition
            });
            this.focus();
        },

        // Finish rendering
        finish: function() {
            // Add editor to content
            this.$editor.appendTo(this.$(".editor-inner"));
            this.editor.resize();
            this.editor.renderer.updateFull();

            return FileEditorView.__super__.finish.apply(this, arguments);
        },

        focus: function() {
            this.editor.focus();
            return this;
        },

        /*
         *  Set editor options: theme, fontsize, ...
         */
        setOptions: function(opts) {
            this.options = _.defaults(opts || {}, userSettings.all({}), {
                mode: "text",
                fontsize: "12",
                printmargincolumn: 80,
                showprintmargin: false,
                highlightactiveline: false,
                wraplimitrange: 80,
                enablesoftwrap: false,
                keyboard: "textinput",
                enablesofttabs: true,
                tabsize: 4
            });

            this.setMode(this.options.mode);
            this.setKeyboardmode(this.options.keyboard);
            this.setTheme(themes.current().editor.theme || aceDefaultTheme);
            this.$editor.css("font-size", this.options.fontsize+"px");
            this.editor.setPrintMarginColumn(this.options.printmargincolumn);
            this.editor.setShowPrintMargin(this.options.showprintmargin);
            this.editor.setHighlightActiveLine(this.options.highlightactiveline);
            this.editor.getSession().setUseWrapMode(this.options.enablesoftwrap);
            this.editor.getSession().setWrapLimitRange(this.options.wraplimitrange, this.options.wraplimitrange);
            this.editor.getSession().setUseSoftTabs(this.options.enablesofttabs);
            this.editor.getSession().setTabSize(this.options.tabsize);
            return this;
        },

        /*
         *  Get editor mode
         */
        getMode: function() {
            return this.options.mode;
        },

        /*
         *  Set editor mode
         *  @lang : editor lang mode
         */
        setMode: function(lang) {
            this.options.mode = lang;
            this.editor.getSession().setMode("ace/mode/"+lang);
            this.trigger("change:mode");
            return this;
        },

        /*
         *  Set editor keyboard mode
         *  @mode: keyboard mode (vim, emacs)
         */
        setKeyboardmode: function(mode) {
            var self = this;
            this.options.keyboard = mode;
            ace.config.loadModule(["keybinding", "ace/keyboard/"+self.options.keyboard], function(binding) {
                if (binding && binding.handler) {
                    self.editor.setKeyboardHandler(binding.handler);
                    self.trigger("change:keyboardmode");
                }
            });
            return this;
        },

        /*
         *  Set theme
         *  @theme_name : name of the theme
         */
        setTheme: function(theme) {
            if (_.isString(theme)) {
                theme = "ace/theme/" + theme;
            }
            this.editor.setTheme(theme);
            this.trigger("change:theme");
            return this;
        },

        /*
         *  Convert indentations to
         */
        convertIndentation: function(ch, len) {
            aceWhitespace.convertIndentation(this.editor.session, ch, len);
        },

        /*
         *  Save file
         */
        saveFile: function(e) {
            if (e) e.preventDefault();
            this.sync.save();
        },

        /*
         *  Run this file
         */
        runFile: function(e) {
            if (e) e.preventDefault();
            this.model.run();
        },

        /*
         *  Open search box in code editor
         */
        searchInFile: function(e) {
            if (e) e.preventDefault();
            this.editor.execCommand("find");
        }
    });

    return FileEditorView;
});