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

            // Bind editor sync state changements
            this.editor.on("sync:state", function(state) {
                this.$(".action-editor-state").toggleClass("btn-danger", !state);
                this.$(".action-editor-state").toggleClass("btn-success", state);
            }, this);

            // Define file for code editor
            this.editor.sync.setFile(this.model, {
                'sync': this.options.edition
            });

            // Parent tab
            this.parent.on("tab:state", function(state) {
                if (state) this.editor.focus();
            }, this);
            this.parent.on("tab:close", function() {
                this.editor.sync.close();
            }, this);
            this.editor.focus();
        },

        // Finish rendering
        finish: function() {
            // Add editor to content
            this.editor.$el.appendTo(this.$(".editor-inner"));
            this.modeChanged();
            this.updateParticipants();

            return FileEditorView.__super__.finish.apply(this, arguments);
        }
    });

    return FileEditorView;
});