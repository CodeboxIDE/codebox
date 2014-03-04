define([
    "settings",
    "text!templates/item.html",
    "less!stylesheets/files.less"
], function(panelSettings, templateFile) {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");
    var box = codebox.require("core/box");
    var ContextMenu = codebox.require("utils/contextmenu");
    var FilesBaseView = codebox.require("views/files/base");

    // File item in the tree
    var FilesTreeViewItem = FilesBaseView.extend({
        tagName: "li",
        className: "file-item",
        templateLoader: "text",
        template: templateFile,
        events: {
            "click .name": "select",
            "dblclick .name": "open"
        },

        // Constructor
        initialize: function(options) {
            FilesTreeViewItem.__super__.initialize.apply(this, arguments);
            var that = this;

            // View for subfiles
            this.subFiles = null;
            this.paddingLeft = this.options.paddingLeft || 0;

            // Context menu
            ContextMenu.add(this.$el, this.model.contextMenu());

            box.on("file.active", function(path) {
                this.$el.toggleClass("active", this.model.path() == path);
            }, this);

            return this;
        },

        render: function() {
            if (this.subFiles) this.subFiles.detach();
            return FilesTreeViewItem.__super__.render.apply(this, arguments);
        },

        // Finish rendering
        finish: function() {
            this.$el.toggleClass("disabled", !this.model.canOpen());
            this.$(">.name").css("padding-left", this.paddingLeft);
            this.$el.toggleClass("type-directory", this.model.isDirectory());

            if (this.subFiles) {
                this.subFiles.$el.appendTo(this.$(".files"));
            }
            return FilesTreeViewItem.__super__.finish.apply(this, arguments);
        },

        // (event) select the file : extend tree
        select: function(e) {
            if (e != null) {
                e.preventDefault();
                e.stopPropagation();
            }

            if (!this.model.canOpen()) {
                return;
            }

            if (this.model.isDirectory()) {
                if (this.subFiles == null) {
                    this.subFiles = new FilesTreeView({
                        "codebox": this.codebox,
                        "model": this.model,
                        "paddingLeft": this.paddingLeft+15
                    }, this);
                    this.subFiles.$el.appendTo(this.$(".files"));
                    this.subFiles.update();
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

            if (!this.model.canOpen()) {
                return;
            }

            if (!this.model.isDirectory()) {
                this.model.open({
                    'userChoice': false
                });
            } else {
                this.select();
            }
        }
    });

    // Complete files tree
    var FilesTreeView = FilesBaseView.extend({
        tagName: "ul",
        className: "cb-files-tree",

        // Constructor
        initialize: function(options) {
            FilesTreeView.__super__.initialize.apply(this, arguments);
            var that = this;

            this.countFiles = 0;
            this.paddingLeft = this.options.paddingLeft || 10;
            
            panelSettings.user.change(function() {
                this.update();
            }, this);

            return this;
        },

        // Render the files tree
        render: function() {
            var that = this;
            this.$el.toggleClass("root", this.model.isRoot());

            // Context menu
            ContextMenu.add(this.$el, this.model.contextMenu());

            this.model.listdir().then(function(files) {
                that.clearComponents();
                that.empty();
                that.countFiles = 0;

                _.each(files, function(file) {
                    if ((file.isGit() && !panelSettings.user.get("gitfolder"))
                    || (file.isHidden() && !panelSettings.user.get("hiddenfiles"))) {
                        return;
                    }
                    
                    var v = new FilesTreeViewItem({
                        "codebox": that.codebox,
                        "model": file,
                        "paddingLeft": that.paddingLeft
                    });
                    v.update();
                    v.$el.appendTo(that.$el);
                    that.addComponent("file", v);

                    that.countFiles = that.countFiles + 1;
                });
                that.trigger("count", that.countFiles);
            });

            return that.ready();
        },
    }, {
        'Item': FilesTreeViewItem
    });

    return FilesTreeView;
});