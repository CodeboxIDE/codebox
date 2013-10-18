define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "views/components/files/base"
], function(_, $, hr, FilesBaseView) {
    var FilesTreeViewItem = FilesBaseView.extend({
        tagName: "li",
        className: "component-files-tree-item",
        template: "components/files/tree.html",
        defaults: _.extend({}, FilesBaseView.prototype.defaults, {
            
        }),
        events: {
            "click .name": "select",
            "dblclick .name": "open"
        },

        initialize: function(options) {
            FilesTreeViewItem.__super__.initialize.apply(this, arguments);
            this.subfiles = null;
            return this;
        },

        /* (event) select the file : extend tree */
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

        /* (event) open the file or directory  */
        open: function(e) {
            if (e != null) {
                e.preventDefault();
                e.stopPropagation();
            }

            hr.History.navigate(this.model.url());
        }
    });

    var FilesTreeView = FilesBaseView.extend({
        tagName: "ul",
        className: "component-files-tree",
        defaults: _.extend({}, FilesBaseView.prototype.defaults, {
            
        }),
        events: {
            
        },

        render: function() {
            var that = this;
            this.$el.empty();

            this.model.listdir().done(function(files) {
                that.empty();
                _.each(files, function(file) {
                    if (file.isHidden()) { return; }
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
    hr.View.Template.registerComponent("component.files.tree", FilesTreeView);

    return FilesTreeView;
});