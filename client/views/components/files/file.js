define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "views/components/files/base",
    "utils/dialogs"
], function(_, $, hr, FilesBaseView, Dialogs) {

    var FileEditorView = FilesBaseView.extend({
        className: "component-files-editor",
        template: "components/files/file.html",
        events: {
            "click .action-file-fullscreen":    "toggleFullscreen",
            "click a[data-editormode]":         "changeEditorMode"
        },

        // Finish rendering
        finish: function() {
            // Bind editor mode changements
            this.components.editor.on("change:mode", function() {
                this.$(".action-file-mode").text(this.components.editor.getMode());
            }, this);

            // Bind editor sync state changements
            this.components.editor.on("sync:state", function(state) {
                this.$(".action-editor-state").toggleClass("btn-danger", !state);
                this.$(".action-editor-state").toggleClass("btn-success", state);
            }, this);

            // Bind collaborators changements
            this.components.editor.on("participants:change", this.updateParticipants, this);

            // Define file for code editor
            this.components.editor.setFile(this.model, {
                'sync': this.options.edition
            });

            return FileEditorView.__super__.finish.apply(this, arguments);
        },

        // (action) Toggle fullscreen
        toggleFullscreen: function(e) {
            e.preventDefault();
            this.$el.toggleClass("mode-fullscreen");
        },

        // (action) change editor mode
        changeEditorMode: function(e) {
            e.preventDefault();
            var mode = $(e.currentTarget).data("editormode");
            this.components.editor.setMode(mode);
        },

        // Update participants list
        updateParticipants: function() {
            this.$(".file-participants").empty();
            _.each(this.components.editor.participants, function(participant) {
                
            }, this);
        }
    });

    // Register as template component
    hr.View.Template.registerComponent("component.files.file", FileEditorView);

    return FileEditorView;
});