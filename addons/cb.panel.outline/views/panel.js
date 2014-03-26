define([
    "less!stylesheets/panel.less"
], function() {
    var _ = codebox.require("hr/utils");
    var Q = codebox.require("hr/promise");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");
    var ContextMenu = codebox.require("utils/contextmenu");
    var PanelBaseView = codebox.require("views/panels/base");
    var rpc = codebox.require("core/backends/rpc");
    var box = codebox.require("core/box");

    var PanelOutlineView = PanelBaseView.extend({
        className: "cb-panel-outline",

        initialize: function() {
            PanelOutlineView.__super__.initialize.apply(this, arguments);

            this.listenTo(box, "file.active", this.render);
            this.tagSeparator = ".";
            this.$tree = $("<ul>", {
                'class': "tags-tree"
            });
            this.$tree.appendTo(this.$el);
        },

        render: function() {
            var that = this;

            return this.updateTags()
            .fin(function() {
                that.ready();
            });
        },

        // Add tag
        addTag: function(tag, $parent) {
            var $tag = $("<li>", {
                'text': tag.showName,
                'data-tag': tag.name,
                'click': function() {
                    $tags.toggle();
                }
            });

            var $tags = $("<ul>", {
                'class': "tags-tree"
            });
            $tags.appendTo($tag);

            $tag.appendTo($parent);

            return {
                '$tag': $tag,
                '$children': $tags
            };
        },

        // Get tag view
        getTag: function(name) {
            var $tag = this.$("li[data-tag='"+name+"']");
            if ($tag.length == 0) return null;
            return $($tag.get(0));
        },

        // Convert tags as a tree
        convertTagsToTree: function(tags) {
            var that = this, tree = {};

            _.each(tags, function(tag) {
                var parent = tree;
                var parts = tag.name.split(that.tagSeparator);
                var _name = _.last(parts);

                _.each(parts, function(part, i) {
                    if (parent[part]) {
                        parent = parent[part].children;
                    } else {
                        _name = parts.slice(i, parts.length).join(that.tagSeparator);
                        return false;
                    }
                });

                parent[_name] = tag;
                parent[_name].showName = _name;
                parent[_name].children = {};
            });

            return tree;
        },

        // Update complete tree
        updateTags: function() {
            var that = this, tree;
            if (box.activeFile == "/") {
                var message = "No outline available for the current file.";
                this.$tree.text(message);
                return Q.reject(message);
            }

            return rpc.execute("codecomplete/get", {
                'file': box.activeFile
            })
            .then(function(tags) {
                tree = that.convertTagsToTree(tags.results);

                that.$tree.empty();

                var addChildren = function($parent, tags) {
                    _.each(tags, function(tag, name) {
                        var vTag = that.addTag(tag, $parent);

                        addChildren(vTag.$children, tag.children);
                    });
                }
                addChildren(that.$tree, tree);
            })
            .then(function() {
                that.ready();
            }, function(err) {
                console.error(err);
            });
        }
    });

    return PanelOutlineView;
});