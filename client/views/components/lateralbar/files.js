define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "models/file",
    "core/box"
], function(_, $, hr, File, box) {
    // Base view for a file element
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
            if (this.model == null) this.model = new File({
                "codebox": box
            });
            this.model.on("set", this.render, this);
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
                return this;
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
    });
    
    // File item in the tree
    var FilesTreeViewItem = FilesBaseView.extend({
        tagName: "li",
        className: "file-item",
        template: "lateralbar/file.html",
        events: {
            "click .name": "select",
            "dblclick .name": "open"
        },

        // Constructor
        initialize: function(options) {
            FilesTreeViewItem.__super__.initialize.apply(this, arguments);
            this.subfiles = null;
            return this;
        },

        // Finish rendering
        finish: function() {
            this.$el.toggleClass("type-directory", this.model.isDirectory());
            return FilesTreeViewItem.__super__.finish.apply(this, arguments);
        },

        // (event) select the file : extend tree
        select: function(e) {
            if (e != null) {
                e.preventDefault();
                e.stopPropagation();
            }

            if (this.model.isDirectory()) {
                if (this.subfiles == null) {
                    this.subfiles = new FilesTreeView({
                        "codebox": this.codebox,
                        "model": this.model
                    });
                    this.subfiles.$el.appendTo(this.$(".files"));
                    this.subfiles.render();
                }
                this.$el.toggleClass("open");
            } else {
                this.open();
            }
        },

        // (event) open the file or directory
        open: function(e) {
            if (e != null) {
                e.preventDefault();
                e.stopPropagation();
            }

            this.model.open();
        }
    });

    // Complete files tree
    var FilesTreeView = FilesBaseView.extend({
        tagName: "ul",
        className: "files-tree",

        // Render the files tree
        render: function() {
            var that = this;
            this.$el.empty();

            this.model.listdir().done(function(files) {
                that.empty();
                _.each(files, function(file) {
                    if (file.isHidden()) return;

                    var v = new FilesTreeViewItem({
                        "codebox": that.codebox,
                        "model": file
                    });
                    v.render();
                    v.$el.appendTo(that.$el);
                });
            });
            
            return this.ready();
        },
    });

    // Register as template component
    hr.View.Template.registerComponent("component.lateralbar.files", FilesTreeView);

    return FilesTreeView;
});