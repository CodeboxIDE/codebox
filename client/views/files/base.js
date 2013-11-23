define([
    'underscore',
    'jQuery',
    'hr/hr',
    'views/tabs/base',
    'models/file',
    'core/box',
    'utils/dialogs',
    'utils/uploader'
], function(_, $, hr, Tab, File, box, Dialogs, Uploader) {

    var FilesBaseView = hr.View.extend({
        defaults: {
            'path': null,
            'base': "/",
            'edition': true,
            'notifications': true
        },
        events: {},

        // Constructor
        initialize: function(options) {
            FilesBaseView.__super__.initialize.apply(this, arguments);

            // Related tab
            this.tab = this.parent;

            // Create base model
            if (this.model == null) this.model = new File({"codebox": box});
            this.model.on("set", this.render, this);

            // Load base file
            if (this.options.path != null) this.load(this.options.path);
            return this;
        },

        // Template rendering context
        templateContext: function() {
            return {
                'options': this.options,
                'file': this.model,
                'view': this
            };
        },

        // Render the file view
        render: function() {
            if (this.model.path() == null) {
                return;
            }
            return FilesBaseView.__super__.render.apply(this, arguments);
        },

        // Finish rendering
        finish: function() {
            return FilesBaseView.__super__.finish.apply(this, arguments);
        },

        // Change the file by loading an other file
        load: function(path) {
            var that = this;
            this.model.getByPath(path).then(function() {
                that.trigger("file:load");
            }, function() {
                that.trigger("file:error");
            })
        },


        // (action) Refresh files list
        fileActionRefresh: function(e) {
            e.preventDefault();
            this.load(this.model.path());  
        },

        // (action) Create a new file
        fileActionCreate: function(e) {
            var that = this;
            if (e) e.preventDefault();
            Dialogs.prompt("Create a new file", "", "newfile.txt").done(function(name) {
                if (name.length > 0) that.model.createFile(name);
            });
        },

        // (action) Create a new directory
        fileActionMkdir: function(e) {
            var that = this;
            if (e) e.preventDefault();
            Dialogs.prompt("Create a new directory", "", "newdirectory").done(function(name) {
                if (name.length > 0) that.model.mkdir(name);
            });
        },

        // (action) Rename a file
        fileActionRename: function(e) {
            var that = this;
            if (e) e.preventDefault();

            Dialogs.prompt("Rename", selection[0].get("name")).done(function(name) {
                if (name.length > 0) that.model.rename(name);
            });
        },

        // (action) Delete files
        fileActionDelete: function(e) {
            var that = this;
            if (e) e.preventDefault();

            Dialogs.confirm("Do your really want to remove these files?").done(function(st) {
                if (st != true) return;
                that.model.remove();
            });
        },

        // (action) Download a file
        fileActionDownload: function(e) {
            var that = this;
            if (e) e.preventDefault();

            that.model.download({
                redirect: true
            });
        },
    });

    return FilesBaseView;
});