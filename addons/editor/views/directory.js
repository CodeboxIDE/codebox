define([
    "views/base",
    "less!stylesheets/directory.less"
], function(FilesBaseView) {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var Uploader = codebox.require("utils/uploader");
    var Dialogs = codebox.require("utils/dialogs");

    var FilesDirectoryView = FilesBaseView.extend({
        className: "editor-files-directory",
        templateLoader: "addon.editor.templates",
        template: "directory.html",
        defaults: _.extend({}, FilesBaseView.prototype.defaults, {
            'navigate': true,
            'hiddenFiles': true
        }),
        events: {
            "click .file": "selectOnlyFile",
            "click .action-open-file": "openFile",
            "click .action-open-parent": "openParent",
            "click .file .select input": "selectFile",
            "change .uploader": "uploadStart",
            "change .uploader-directory": "uploadStart",
            "click .action-file-togglehidden": "toggleHiddenFiles",
            "click .action-file-refresh": "actionRefresh",
            "click .action-file-create": "actionCreate",
            "click .action-file-upload": "actionUpload",
            "click .action-file-upload-directory": "actionUploadDirectory",
            "click .action-file-mkdir": "actionMkdir",
            "click .action-file-rename": "actionRename",
            "click .action-file-delete": "actionDelete",
            "click .action-file-download": "actionDownload",
        },

        // Constructor
        initialize: function(options) {
            FilesDirectoryView.__super__.initialize.apply(this, arguments);
            this.files = null;

            // Refresh list
            this.model.on("set", this.refresh, this);

            // Selection
            this.selectedFiles = [];
            this.on("selection:change", function(t) {
                this.$("*[data-filesselection]").toggleClass("disabled", _.size(this.selectedFiles) == 0); 
            }, this);

            // Uploader
            this.uploader = new Uploader({
                "directory": this.model
            });
            this.uploader.on("state", function(percent) {
                self.$(".action-file-upload-select").removeClass("btn-danger");
                self.$(".action-file-upload-select .percent").text(percent+"%");
            });
            this.uploader.on("error", function() {
                self.$(".action-file-upload-select").addClass("btn-danger");
                self.$(".action-file-upload-select .percent").text("Error!");
            });
            this.uploader.on("end", function() {
                self.$(".action-file-upload-select").removeClass("btn-danger");
                self.$(".action-file-uploadd-select .percent").text("");
            });

            this.refresh();

            return this;
        },

        // Template rendering context
        templateContext: function() {
            return {
                options: this.options,
                file: this.model,
                files: this.files || [],
                view: this
            };
        },

        // Render directory view
        render: function() {
            if (this.files == null) {
                return this;
            }
            return FilesDirectoryView.__super__.render.apply(this, arguments);
        },

        // Finish rendering
        finish: function() {
            this.unselectFiles();
            this.$(".file-hidden").toggle(!this.options.hiddenFiles);
            /*this.$(".collaborators a").tooltip({
                placement: "bottom"
            });*/
            return FilesDirectoryView.__super__.finish.apply(this, arguments);
        },

        // Return array of files selected
        getFilesSelection: function() {
            return _.filter(this.files, function(file) {
                return _.contains(this.selectedFiles, file.path());
            }, this);
        },

        // (action) toggle hidden files
        toggleHiddenFiles: function(e) {
            if (e != null) e.preventDefault();
            this.options.hiddenFiles = !this.options.hiddenFiles;
            return this.render();
        },

        // Refresh list
        refresh: function() {
            var that = this;
            if (this.model.path() == null || !this.model.isDirectory()) { return; }
            this.model.listdir().then(function(files) {
                that.files = files;
                that.render();
            }, function() {
                throw "error when getting sub file";
            });
        },

        // (action) Refresh files list
        actionRefresh: function(e) {
            e.preventDefault();
            this.load(this.model.path());  
        },

        // (action) Create a new file
        actionCreate: function(e) {
            var self = this;
            e.preventDefault();
            Dialogs.prompt("Create a new file", "newfile.txt").done(function(name) {
                if (name.length > 0) self.model.createFile(name);
            });
        },

        // (action) Create a new directory
        actionMkdir: function(e) {
            var self = this;
            e.preventDefault();
            Dialogs.prompt("Create a new directory", "newdirectory").done(function(name) {
                if (name.length > 0) self.model.mkdir(name);
            });
        },

        // (action) Rename a file
        actionRename: function(e) {
            var selection;
            var self = this;
            e.preventDefault();

            selection = this.getFilesSelection();
            if (_.size(selection) == 0) return;

            Dialogs.prompt("Rename", selection[0].get("name")).done(function(name) {
                if (name.length > 0) selection[0].rename(name);
            });
        },

        // (action) Delete files
        actionDelete: function(e) {
            var selection;
            var self = this;
            e.preventDefault();

            selection = this.getFilesSelection();
            if (_.size(selection) == 0) return;

            Dialogs.confirm("Do your really want to remove these files?").done(function(st) {
                if (st != true) return;
                _.each(selection, function(file) {
                    file.remove();
                });
            });
        },

        // (action) Download a file
        actionDownload: function(e) {
            var selection;
            var self = this;
            e.preventDefault();

            selection = this.getFilesSelection();
            if (_.size(selection) == 0) return;

            selection[0].download({
                redirect: true
            });
        },

        // (action) Upload a file
        actionUpload: function(e) {
            var self = this;
            e.preventDefault();
            this.$(".uploader").trigger('click');
        },

        // (action) Upload a directory
        actionUploadDirectory: function(e) {
            var self = this;
            e.preventDefault();
            this.$(".uploader-directory").trigger('click');
        },

        // (event) Start files upload
        uploadStart: function(e) {
            e.preventDefault();
            this.uploader.upload(e.currentTarget.files);
        },

        // (event) Select the files
        selectFile: function(e) {
            e.stopPropagation();
            var file = $(e.currentTarget).parents(".file");
            this.toggleFileSelection(file, $(e.currentTarget).is(":checked"));
        },

        // (event) Open a file
        openFile: function(e) {
            e.preventDefault();
            var file = $(e.currentTarget).parents(".file");
            var path = file.data("filepath");
            if (path == null || path.length == 0) { return; }
            file = _.find(this.files, function(cfile) {
                return cfile.path() == path;
            });
            file.open();
        },

        // (event) Open parent folder
        openParent: function(e) {
            e.preventDefault();
            this.model.open(this.model.parentPath());
        },

        // (event) Select only one file
        selectOnlyFile: function(e) {
            this.unselectFiles();
            var file = $(e.currentTarget);
            this.toggleFileSelection(file, true);
        },

        // Unselect files
        unselectFiles: function() {
            this.selectedFiles = [];
            this.$(".file").removeClass("selected");
            this.$(".file .select input").prop("checked", false);
            this.trigger("selection:change", this.selectedFiles);
        },

        // (event) Toggle the selection of a file
        toggleFileSelection: function(file, st) {
            var path;
            file = $(file);
            path = file.data("filepath");
            if (path == null || path.length == 0) { return; }

            // Change display state
            file.toggleClass("selected", st);
            file.find(".select input").prop("checked", st);

            // Chaneg list
            if (_.contains(this.selectedFiles, path) && st == false) {
                this.selectedFiles.splice(this.selectedFiles.indexOf(path), 1);
            } else if (st == true) {
                this.selectedFiles.push(path);
            }
            this.selectedFiles = _.uniq(this.selectedFiles);
            this.trigger("selection:change", this.selectedFiles);
        },
    });

    return FilesDirectoryView;
});