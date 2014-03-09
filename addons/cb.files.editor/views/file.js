define([
    "ace",
    "theme/textmate",
    "text!templates/file.html",
    "less!stylesheets/file.less",
], function(ace, aceDefaultTheme, templateFile) {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");
    var alerts = codebox.require("utils/alerts");
    var FilesTabView = codebox.require("views/files/tab");
    var FileSync = codebox.require("utils/filesync");
    var user = codebox.require("core/user");
    var menu = codebox.require("core/commands/menu");
    var settings = codebox.require("core/settings");
    var Command = codebox.require("models/command");
    var themes = codebox.require("core/themes");
    var box = codebox.require("core/box");
    var collaborators = codebox.require("core/collaborators");
    var keyboard = codebox.require("utils/keyboard");

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

            // Toggle collaboration
            this.collaborationToggle = new Command({}, {
                'type': "checkbox",
                'title': "Toggle Collaboration Mode",
                'flags': this.model.isNewfile() ? "hidden": "",
                'offline': false,
                'action': function(state) {
                    that.editor
                    that.sync.updateEnv({
                        'sync': state
                    });
                }
            });

            // Collaborators
            this.collaboratorsMenu = new Command({}, {
                'title': "Collaborators",
                'type': "menu",
                'flags': "disabled"
            });

            // Statusbar
            this.editorStatusCommand = new Command({}, {
                'title': "Line 1, Column 1",
                'type': "label"
            });
            this.tab.statusbar.add(this.editorStatusCommand);
            this.tab.statusbar.add(this.collaboratorsMenu);
            this.tab.statusbar.add(syntaxMenu);

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
                this.collaborationToggle,
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
            this.sync.on("update:env", function(options) {
                if (options.reset) {
                    this._op_set = true;
                    this.editor.setValue("");
                    this._op_set = false;
                }
                this.collaborationToggle.toggleFlag("active", options.sync);
                this.collaboratorsMenu.toggleFlag("disabled", !options.sync);
            }, this);

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
            var update = function() {
                var ops = _.extend({}, {
                    "mode": this.options.mode,
                    "readonly": this.options.readonly
                });
                this.setOptions(ops);
            };
            userSettings.change(update, this);
            user.settings("themes").change(update, this);

            // Bind editor changement -> sync
            this.editor.getSession().selection.on('changeSelection', function(){
                var selection = that.editor.getSelectionRange();
                that.sync.updateUserSelection(selection.start.column, selection.start.row, selection.end.column, selection.end.row);
            });
            this.editor.getSession().selection.on('changeCursor', function(){
                var cursor = that.editor.getSession().getSelection().getCursor();
                that.sync.updateUserCursor(cursor.column, cursor.row);
                that.editorStatusCommand.set("title", "Line "+(cursor.row+1)+", Column "+(cursor.column+1));
            });

            var $doc = this.editor.session.doc;

            // Force unix newline mode (for cursor position calcul)
            $doc.setNewLineMode("unix");

            // Send change
            $doc.on('change', function(d) {
                if (that._op_set) return;
                that.sync.updateContent(that.editor.session.getValue());
            });

            // Bind sync -> editor
            this.sync.on("file:mode", function(mode) {
                this.setMode(mode)
            }, this);
            this.sync.on("content", function(content, oldcontent, patches) {
                var selection, cursor_lead, cursor_anchor, scroll_y, operations;

                // if resync patches is null
                patches = patches || [];

                // Calcul operaitons from patch
                operations = this.sync.patchesToOps(patches);

                // Do some operations on selection to preserve selection
                selection = this.editor.getSession().getSelection();

                scroll_y = this.editor.getSession().getScrollTop();

                cursor_lead = selection.getSelectionLead();
                cursor_lead = this.sync.cursorApplyOps({
                    x: cursor_lead.column,
                    y: cursor_lead.row
                }, operations, oldcontent);

                cursor_anchor = selection.getSelectionAnchor();
                cursor_anchor = this.sync.cursorApplyOps({
                    x: cursor_anchor.column,
                    y: cursor_anchor.row
                }, operations, oldcontent);

                // Set editor content
                this._op_set = true;

                // Apply ace delta all in once
                $doc.applyDeltas(
                    _.map(operations, function(op) {
                        return {
                            action: op.type+"Text",
                            range: {
                                start: that.posFromIndex(op.index),
                                end: that.posFromIndex(op.index + op.content.length)
                            },
                            text: op.content
                        }
                    })
                );

                // Check document content is as expected
                if ($doc.getValue() != content) {
                    logging.error("Invalid operation ", content, $doc.getValue());
                    $doc.setValue(content);
                    this.sync.sendSync();
                }
                this._op_set = false;

                // Move cursors
                this.editor.getSession().setScrollTop(scroll_y);

                cursor_anchor = this.sync.cursorPosByindex(cursor_anchor, content);
                this.editor.getSession().getSelection().setSelectionAnchor(cursor_anchor.y, cursor_anchor.x);

                cursor_lead = this.sync.cursorPosByindex(cursor_lead, content);
                this.editor.getSession().getSelection().selectTo(cursor_lead.y, cursor_lead.x);
            }, this);

            // Participant cursor moves
            this.sync.on("cursor:move", function(cId, c) {
                var name, range = new aceRange.Range(c.y, c.x, c.y, c.x+1);

                // Remove old cursor
                if (this.markersC[cId]) this.editor.getSession().removeMarker(this.markersC[cId]);

                // Calcul name
                name = cId
                var participant = collaborators.getById(cId);
                if (participant) name = participant.get("name");

                // Add new cursor
                this.markersC[cId] = this.editor.getSession().addMarker(range, "marker-cursor marker-"+c.color.replace("#", ""), function(html, range, left, top, config){
                    html.push("<div class='marker-cursor' style='top: "+top+"px; left: "+left+"px; border-left-color: "+c.color+"; border-bottom-color: "+c.color+";'>"
                    + "<div class='marker-cursor-nametag' style='background: "+c.color+";'>&nbsp;"+name+"&nbsp;<div class='marker-cursor-nametag-flag' style='border-right-color: "+c.color+"; border-bottom-color: "+c.color+";'></div>"
                    + "</div>&nbsp;</div>");  
                }, true);
            }, this);

            // Participant selection 
            this.sync.on("selection:move", function(cId, c) {
                var range = new aceRange.Range(c.start.y, c.start.x, c.end.y, c.end.x);
                if (this.markersS[cId]) this.editor.getSession().removeMarker(this.markersS[cId]);
                this.markersS[cId] = this.editor.getSession().addMarker(range, "marker-selection marker-"+c.color.replace("#", ""), "line", false);
            }, this);

            // Remove a cursor/selection
            this.sync.on("cursor:remove selection:remove", function(cId) {
                if (this.markersC[cId]) this.editor.getSession().removeMarker(this.markersC[cId]);
                if (this.markersS[cId]) this.editor.getSession().removeMarker(this.markersS[cId]);
                delete this.markersC[cId];
                delete this.markersS[cId]
            }, this);

            // Participants list change
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

            // Parent tab
            this.tab.on("tab:layout", function() {
                this.editor.resize();
                this.editor.renderer.updateFull();
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
            this.sync.on("close", function(mode) {
                this.tab.closeTab();
            }, this);
            this.sync.on("error", function(err) {
                alerts.show("Error: "+(err.message || err), 3000);
            }, this);

            this.sync.on("sync:modified", function(state) {
                this.tab.setTabState("modified", state);
            }, this);

            this.sync.on("sync:loading", function(state) {
                this.tab.setTabState("loading", state);
            }, this);

            // Define file for code editor
            this.sync.setFile(this.model, {
                'sync': userSettings.get("autocollaboration") ? collaborators.size() > 1 : false
            });
            this.focus();

            var $input = this.editor.textInput.getElement();
            var handleKeyEvent = function(e) {
                if (!e.altKey && !e.ctrlKey && !e.metaKey) return;
                keyboard.enableKeyEvent(e);
            };
            $input.addEventListener('keypress', handleKeyEvent, false);
            $input.addEventListener('keydown', handleKeyEvent, false);
            $input.addEventListener('keyup', handleKeyEvent, false);
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
            this.editor.resize();
            this.editor.renderer.updateFull();
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

        posFromIndex: function(index) {
            var row, lines;
            lines = this.editor.session.doc.getAllLines();
            for (row = 0; row < lines.length; row++) {
                var line = lines[row];
                if (index <= (line.length)) break;
                index = index - (line.length + 1);
            }
            
            return {
                'row': row,
                'column': index
            };
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