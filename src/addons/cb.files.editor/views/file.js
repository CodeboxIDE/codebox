define([
    "ace/ace",
    "ace/range",
    "ace/ext/language_tools",
    "less!stylesheets/file.less"
], function(ace, CRange) {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var Dialogs = codebox.require("utils/dialogs");
    var FilesBaseView = codebox.require("views/files/base");
    var FileSync = codebox.require("utils/filesync");
    var user = codebox.require("core/user");

    var logging = hr.Logger.addNamespace("editor");
    var settings = user.settings("aceeditor");

    var FileEditorView = FilesBaseView.extend({
        className: "addon-files-aceeditor",
        templateLoader: "addon.cb.files.editor.templates",
        template: "file.html",
        defaults: {},
        events: {},

        // Constructor
        initialize: function() {
            var that = this;
            FileEditorView.__super__.initialize.apply(this, arguments);

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

            // Configure editor
            this.editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true
            });

            // Bind settings changement
            settings.change(function() {
                var ops = _.extend({}, {
                    "mode": this.options.mode,
                    "readonly": this.options.readonly
                });
                this.setOptions(ops);
            }, this);

            // Bind editor changement
            this.editor.getSession().selection.on('changeSelection', function(){
                var selection = that.editor.getSelectionRange();
                that.sync.updateUserSelection(selection.start.column, selection.start.row, selection.end.column, selection.end.row);
            });
            this.editor.getSession().selection.on('changeCursor', function(){
                var cursor = that.editor.getSession().getSelection().getCursor();
                that.sync.updateUserCursor(cursor.column, cursor.row);
            });
            this.editor.getSession().doc.on('change', function(d) {
                that.sync.updateContent(that.editor.session.getValue());
            });

            // Bind sync changement
            this.sync.on("mode", function(mode) {
                this.setMode(mode)
            }, this);
            this.sync.on("sync:state", function(state) {
                this.setReadonly(!state)
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
                this.editor.setValue(content);

                // Move cursors
                this.editor.getSession().setScrollTop(scroll_y);

                cursor_anchor = this.sync.cursorPosByindex(cursor_anchor, content);
                this.editor.getSession().getSelection().setSelectionAnchor(cursor_anchor.y, cursor_anchor.x);

                cursor_lead = this.sync.cursorPosByindex(cursor_lead, content);
                this.editor.getSession().getSelection().selectTo(cursor_lead.y, cursor_lead.x);
            }, this);
            this.sync.on("cursor:move", function(cId, c) {
                var range = new CRange.Range(c.y, c.x, c.y, c.x+1);
                if (this.markersC[cId]) this.editor.getSession().removeMarker(this.markersC[cId]);
                this.markersC[cId] = this.editor.getSession().addMarker(range, "marker-cursor marker-"+c.color.replace("#", ""), "text", true);
            }, this);
            this.sync.on("selection:move", function(cId, c) {
                var range = new CRange.Range(c.start.y, c.start.x, c.end.y, c.end.x);
                if (this.markersS[cId]) this.editor.getSession().removeMarker(this.markersS[cId]);
                this.markersS[cId] = this.editor.getSession().addMarker(range, "marker-selection marker-"+c.color.replace("#", ""), "line", false);
            }, this);
            this.sync.on("cursor:remove selection:remove", function(cId) {
                this.editor.getSession().removeMarker(cId);
            }, this);

            // Commands
            this.editor.commands.addCommand({
                name: 'save',
                readOnly: true,
                bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
                exec: _.bind(function(editor) {
                    this.sync.save();
                }, this)
            });

            // Parent tab
            this.tab.on("tab:state", function(state) {
                if (state) this.focus();
            }, this);
            this.tab.on("tab:close", function() {
                this.sync.close();
                this.off();
            }, this);

            // Bind editor sync state changements
            this.sync.on("sync:state", function(state) {
                if (!state) {
                    this.tab.setTabState("offline", true);
                } else {
                    this.tab.setTabState("offline", false);
                }
            }, this);

            this.sync.on("sync:modified", function(state) {
                this.tab.setTabState("warning", state);
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
            this.options = _.defaults(opts || {}, settings.all({}), {
                mode: "text",
                theme: "textmate",
                fontsize: "12",
                printmargincolumn: 80,
                showprintmargin: false,
                highlightactiveline: false,
                wraplimitrange: 80,
                enablesoftwrap: false,
                keyboard: "textinput",
                readonly: false
            });

            this.setMode(this.options.mode);
            this.setKeyboardmode(this.options.keyboard);
            this.setTheme(this.options.theme);
            this.setFontsize(this.options.fontsize);
            this.setPrintmargincolumn(this.options.printmargincolumn);
            this.setShowprintmargin(this.options.showprintmargin);
            this.setHighlightactiveline(this.options.highlightactiveline);
            this.setEnablesoftwrap(this.options.enablesoftwrap);
            this.setWraplimitrange(this.options.wraplimitrange);
            this.setReadonly(this.options.readonly);
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
         *  Set font size
         *  @fontsize : font size for the editor text
         */
        setFontsize: function(fontsize) {
            this.options.fontsize = parseInt(fontsize);
            this.editor.setFontSize(this.options.fontsize);
            this.trigger("change:fontsize");
            return this;
        },

        /*
         *  Set print margin column
         *  @value : number of column for print margin
         */
        setPrintmargincolumn: function(value) {
            this.options.printmargincolumn = value;
            this.editor.setPrintMarginColumn(this.options.printmargincolumn);
            return this;
        },

        /*
         *  Set show print margin column
         *  @value : number of column for print margin
         */
        setShowprintmargin: function(value) {
            this.options.showprintmargin = value;
            this.editor.setShowPrintMargin(this.options.showprintmargin);
            return this;
        },

        /*
         *  Set highlight active line
         *  @value : boolean : true => highlight all the active line
         */
        setHighlightactiveline: function(value) {
            this.options.highlightactiveline = value;
            this.editor.setHighlightActiveLine(this.options.highlightactiveline);
            return this;
        },

        /*
         *  Set wrap limit range
         */
        setWraplimitrange: function(value) {
            this.options.wraplimitrange = value;
            this.editor.getSession().setWrapLimitRange(this.options.wraplimitrange, this.options.wraplimitrange);
            return this;
        },

        /*
         *  Set enable soft wrap
         */
        setEnablesoftwrap: function(value) {
            this.options.enablesoftwrap = value;
            this.editor.getSession().setUseWrapMode(this.options.enablesoftwrap);
            return this;
        },

        /*
         *  Set theme
         *  @theme_name : name of the theme
         */
        setTheme: function(theme_name) {
            this.options.theme = theme_name;
            this.editor.setTheme("ace/theme/" + theme_name);
            this.trigger("change:theme");
            return this;
        },

        /*
         *  Set read only mode
         *  @b : boolean for read only mode
         */
        setReadonly: function(b) {
            this.readonly = b;
            this.editor.setReadOnly(b);
            return this;
        }
    });

    return FileEditorView;
});