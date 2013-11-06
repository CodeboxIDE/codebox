define([
    "views/directory",
    "views/file",
    "less!stylesheets/tab.less"
], function(FilesDirectoryView, FileEditorView) {
    var _ = require("underscore");
    var $ = require("jQuery");
    var hr = require("hr/hr");
    var Tab = require("views/tabs/base")
    var box = require("core/box");
    var File = require("models/file");

    var EditorTab = Tab.extend({
        className: Tab.prototype.className+ " addon-editor-tab",
        defaults: {
            'path': "/"
        },

        initialize: function(options) {
            EditorTab.__super__.initialize.apply(this, arguments);

            // Create the file view
            this.file = new File({
                'codebox': box
            });

            // Bind file events
            this.file.on("set", this.render, this);
            this.file.on("destroy", function() {
                this.closeTab();
            }, this);
            
            // When tab is ready : load file
            this.on("tab:ready", function() {
                this.adaptFile();
                this.load(this.options.path);
            }, this);

            return this;
        },

        /* Render */
        render: function() {
            this.$el.empty();

            var v, fV, that = this;

            if (this.file.isDirectory()) {
                fv = FilesDirectoryView;
            } else {
                fv = FileEditorView;
            }

            f = new fv({
                model: this.file
            }, this);

            f.render();
            f.$el.appendTo(this.$el);
            this.adaptFile();
            return this.ready();
        },

        /* Change the file */
        load: function(path) {
            var that = this;
            this.file.getByPath(path).then(null, function() {
                console.log(arguments);
                that.closeTab();
            })
            return this;
        },

        /* Adapt the tab to the file (title, ...) */
        adaptFile: function() {
            this.setTabTitle(this.file.get("name", "loading..."));
            this.setTabType(this.file.isDirectory() ? "directory" : "file");
            this.setTabId(this.file.path());
            return this;
        },

        /* Command save file */
        saveFile: function(e) {
            e.preventDefault();
        }
    });

    return EditorTab;
});