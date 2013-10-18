define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "views/components/files/base",
    "views/components/files/directory",
    "views/components/files/file"
], function(_, $, hr, FilesBaseView, FilesDirectoryView, FileEditorView) {

    var FileView = FilesBaseView.extend({
        className: "component-file",
        template: "components/files/normal.html",
        defaults: _.extend({}, FilesBaseView.prototype.defaults, {
            
        }),
        events: {
            
        },

        initialize: function(options) {
            FileView.__super__.initialize.apply(this, arguments);
            return this;
        },
        render: function() {
            if (this.model.path() == null) return this;
            return FileView.__super__.render.apply(this, arguments);
        },
        finish: function() {
            this.$('.files-toolbar .btn').tooltip({
                placement: "bottom"
            });
            var file = this.components.editor != null ? this.components.editor : this.components.directory;
            file.on("all", function() {
                this.trigger.apply(this, arguments);
            }, this);
            return FileView.__super__.finish.apply(this, arguments);
        },
    });
    hr.View.Template.registerComponent("component.file", FileView);

    return FileView;
});