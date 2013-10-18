define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "views/components/files/base",
    "views/dialogs/utils"
], function(_, $, hr, FilesBaseView, Dialogs) {

    var FileEditorView = FilesBaseView.extend({
        className: "component-files-editor",
        template: "components/files/file.html",
        defaults: _.extend({}, FilesBaseView.prototype.defaults, {
            
        }),
        events: {
            "click .action-file-delete": "deleteFile",
            "click .action-editor-state": "pingSync",
            "click .action-file-fullscreen": "toggleFullscreen",
            "click a[data-editormode]": "changeEditorMode"
        },

        initialize: function(options) {
            FileEditorView.__super__.initialize.apply(this, arguments);
            return this;
        },

        finish: function() {
            this.components.editor.on("change:mode", function() {
                this.$(".action-file-mode").text(this.components.editor.getMode());
            }, this);
            this.components.editor.setFile(this.model, {
                sync: this.options.edition
            });
            this.components.editor.on("sync:state", function(state) {
                this.$(".action-editor-state").toggleClass("btn-danger", !state);
                this.$(".action-editor-state").toggleClass("btn-success", state);
            }, this);
            this.components.editor.on("participants:change", this.updateParticipants, this);

            
            if (this.components.plugins != null) {
                this.components.plugins.on("open", function(plugin) {
                    this.trigger("plugin:open", plugin);
                }, this);
            }

            return FileEditorView.__super__.finish.apply(this, arguments);
        },

        /* (action) Toggle fullscreen */
        toggleFullscreen: function(e) {
            e.preventDefault();
            this.$el.toggleClass("mode-fullscreen");
        },

        /* (action) change editor mode */
        changeEditorMode: function(e) {
            e.preventDefault();
            var mode = $(e.currentTarget).data("editormode");
            this.components.editor.setMode(mode);
        },

        /* (action) ping state */
        pingState: function(e) {
            e.preventDefault();
        },

        /* (action) delete the file */
        deleteFile: function(e) {
            e.preventDefault();
            Dialogs.confirm(hr.I18n.t("components.files.file.dialogs.delete")).done(_.bind(function(state) {
                if (state == true) this.model.remove();
            }, this));
        },

        /* Update participants list */
        updateParticipants: function() {
            this.$(".file-participants").empty();
            _.each(this.components.editor.participants, function(participant) {
                
            }, this);
        }
    });
    hr.View.Template.registerComponent("component.files.file", FileEditorView);

    return FileEditorView;
});