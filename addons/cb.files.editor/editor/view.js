define([
    "ace",
    "editor/breakpoints",
    "editor/codecomplete",
    "editor/jshint",
    "editor/settings",
    "theme/textmate",
    "text!templates/file.html",
    "less!stylesheets/file.less",
], function(ace, Breakpoints, codecomplete, jshint, editorSettings, aceDefaultTheme, templateFile) {
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
    var debugManager = codebox.require("core/debug/manager");

    var logging = hr.Logger.addNamespace("editor");

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

            this.markersS = {};
            this.markersC = {};
            this._op_set = false;

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
                        aceWhitespace.convertIndentation(that.editor.session, " ", editorSettings.user.get("tabsize", 4));
                    }
                },
                {
                    'title': "Convert Indentation to Tabs",
                    'action': function() {
                        aceWhitespace.convertIndentation(that.editor.session, "\t", 1);
                    }
                },
                {
                    'title':"Strip Whitespaces",
                    'action': function() {
                        that.stripspaces();
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

            // Create base ace editor instance and configure it
            this.$editor = $("<div>", {
                'class': "editor-ace"
            });
            this.editor = ace.edit(this.$editor.get(0));
            var $doc = this.editor.session.doc;

            // Set base options
            this.editor.session.setUseWorker(true);
            this.editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true
            });

            // Force unix newline mode (for cursor position calcul)
            $doc.setNewLineMode("unix");
            this.setOptions();

            // Debug and Breakpoints
            this.breakpoints = new Breakpoints({
                editor: this
            });

            // Read-only when debugger is active
            this.listenTo(debugManager, "state", function(state) {
                this.editor.setReadOnly(state);
            });
            this.editor.setReadOnly(debugManager.isActive());

            // Show active debug line
            this.listenTo(debugManager, "position", this.updateDebugLine);
            this.updateDebugLine();

            // Bind settings changement
            var update = function() {
                var ops = _.extend({}, {
                    "mode": this.options.mode,
                    "readonly": this.options.readonly
                });
                this.setOptions(ops);
            };
            editorSettings.user.change(update, this);
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
            this.editor.getSession().on("changeMode", function() {
                jshint.applySettings(that.editor);
            });


            // Clear command on Windows/ChromeOS Ctrl-Shift-P
            this.editor.commands.addCommands([{
                name: "commandpalette",
                bindKey: {
                    win: "Ctrl-Shift-P",
                    mac: "Command-Shift-P"
                },
                exec: function(editor, line) {
                    return false;
                },
                readOnly: true
            }]);

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
                // Clear breakpoints
                this.model.clearBreakpoints();

                // Finish sync
                this.sync.close();

                // Destroy the editor
                this.editor.destroy();

                // Destroy events and instance
                this.off();
                this.stopListening();
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

            this.sync.once("content", function() {
                this.adaptOptions();
            }, this);

            // Define file for code editor
            this.sync.setFile(this.model, {
                'sync': editorSettings.user.get("autocollaboration") ? collaborators.size() > 1 : false
            });

            // Options chnagements
            this.on("file:options", this.adaptOptions, this);

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
            this.$editor.appendTo(this.$(".editor-inner"));
            this.editor.resize();
            this.editor.renderer.updateFull();

            return FileEditorView.__super__.finish.apply(this, arguments);
        },

        // Focus editor
        focus: function() {
            this.editor.resize();
            this.editor.renderer.updateFull();
            this.editor.focus();
            return this;
        },

        // Define editor options
        setOptions: function(opts) {
            var that = this;
            this.options = _.defaults(opts || {}, editorSettings.user.all({}), {
                mode: "text",
                fontsize: "12",
                printmargincolumn: 80,
                showprintmargin: false,
                showinvisibles: false,
                highlightactiveline: false,
                wraplimitrange: 80,
                enablesoftwrap: false,
                keyboard: "textinput",
                enablesofttabs: true,
                tabsize: 4
            });

            // Ste mode
            this.setMode(this.options.mode);

            // Det keyboard mode
            ace.config.loadModule(["keybinding", "ace/keyboard/"+this.options.keyboard], function(binding) {
                if (binding && binding.handler) that.editor.setKeyboardHandler(binding.handler);
            });

            this.editor.setTheme(themes.current().editor.theme || aceDefaultTheme);
            this.$editor.css("font-size", this.options.fontsize+"px");
            this.editor.setPrintMarginColumn(this.options.printmargincolumn);
            this.editor.setShowPrintMargin(this.options.showprintmargin);
            this.editor.setShowInvisibles(this.options.showinvisibles);
            this.editor.setHighlightActiveLine(this.options.highlightactiveline);
            this.editor.getSession().setUseWrapMode(this.options.enablesoftwrap);
            this.editor.getSession().setWrapLimitRange(this.options.wraplimitrange, this.options.wraplimitrange);
            this.editor.getSession().setUseSoftTabs(this.options.enablesofttabs);
            this.editor.getSession().setTabSize(this.options.tabsize);
            return this;
        },

        // Define mdoe option
        setMode: function(lang) {
            this.options.mode = lang;
            this.editor.getSession().setMode("ace/mode/"+lang);
        },

        // Get position (row, column) from index in file
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

        // (action) Save file
        saveFile: function(e) {
            if (e) e.preventDefault();
            
            if (editorSettings.user.get("stripspaces")) {
                this.stripspaces();
            }
            
            this.sync.save();
        },
        
        stripspaces: function(e) {
            if (e) e.preventDefault();
            
            // strip all whitespaces from the current document
            var doc = this.editor.session.doc;
            var lines = doc.getAllLines();
            
            for (var i = 0; i < lines.length; ++i) {
                var index = lines[i].search(/\s+$/);
                if (index !== -1 && index != 0)
                    doc.removeInLine(i, index, lines[i].length);
            }
        },

        // (action) Run this file
        runFile: function(e) {
            if (e) e.preventDefault();
            this.model.run();
        },

        // (action) Open search box
        searchInFile: function(e) {
            if (e) e.preventDefault();
            this.editor.execCommand("find");
        },

        // Show active line in debug
        updateDebugLine: function() {
            var position = debugManager.getPosition();

            // Clear previous marker
            if (this.debugMarker != null) {
                this.editor.session.removeMarker(this.debugMarker);
                this.debugMarker = null;
            }
            if (position && position.filename == this.model.path()) {
                this.debugMarker = this.editor.session.addMarker(new aceRange.Range(parseInt(position.line) - 1, 0, parseInt(position.line) - 1, 2000), "marker-debug", "line", false);
                console.log(this.debugMarker);
            }
        },

        // Update current line according to options
        adaptOptions: function() {
            if (this.fileOptions.line) {
                this.editor.gotoLine(this.fileOptions.line);
            } else if (this.fileOptions.pattern) {
                this.editor.find(this.fileOptions.pattern,{
                    regExp: false,
                    backwards: false,
                    wrap: true
                });
            }
        }
    });

    return FileEditorView;
});
