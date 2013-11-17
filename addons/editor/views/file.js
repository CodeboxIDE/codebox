define([
    "views/base",
    "views/editor",
    "less!stylesheets/file.less"
], function(FilesBaseView, EditorView) {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var Dialogs = codebox.require("utils/dialogs");

    var FileEditorView = FilesBaseView.extend({
        className: "editor-files-editor",
        templateLoader: "addon.editor.templates",
        template: "file.html",
        events: {
            
        },

        // Constructor
        initialize: function() {
            FileEditorView.__super__.initialize.apply(this, arguments);

            // Build editor
            this.editor = new EditorView();

            // Parent tab
            this.tab.on("tab:state", function(state) {
                if (state) this.editor.focus();
            }, this);
            this.tab.on("tab:close", function() {
                this.editor.sync.close();
                this.editor.off();
            }, this);

            // Bind editor sync state changements
            this.editor.sync.on("sync:state", function(state) {
                if (!state) {
                    this.tab.setTabState("offline", true);
                } else {
                    this.tab.setTabState("offline", false);
                }
            }, this);

            this.editor.sync.on("sync:modified", function(state) {
                this.tab.setTabState("warning", state);
            }, this);

            // Define file for code editor
            this.editor.sync.setFile(this.model, {
                'sync': this.options.edition
            });
            this.editor.focus();
        },

        // Finish rendering
        finish: function() {
            // Add editor to content
            this.editor.$el.appendTo(this.$(".editor-inner"));

            return FileEditorView.__super__.finish.apply(this, arguments);
        }
    });

    return FileEditorView;
});