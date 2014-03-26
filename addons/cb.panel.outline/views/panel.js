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
    var files = codebox.require("core/files");

    var PanelOutlineView = PanelBaseView.extend({
        className: "cb-panel-outline",
        events: {
            "click": "onClick",
            "keyup input": "onKeyup"
        },

        initialize: function() {
            PanelOutlineView.__super__.initialize.apply(this, arguments);

            this.listenTo(box, "file.active", this.render);
            this.tagSeparator = ".";

            // Map path -> tree
            this.$trees = {};
                
            this.$filterInput = $("<input>", {
                'type': "text",
                'class': "form-control input-sm",
                "placeholder": "Filter Tags"
            });
            this.$treeContainer = $("<div>", {
                'class': "tree-container"
            });

            this.$filterInput.appendTo(this.$el);
            this.$treeContainer.appendTo(this.$el);
        },

        render: function() {
            var that = this;

            return this.updateTags()
            .fin(function() {
                that.ready();
            });
        },

        // Add tag
        addTag: function(tag, $parent, hasChildren) {
            var $tags;

            var open = function() {
                files.open(box.activeFile, {
                    // Open content "/^ foo $/"" _> "foo" in editor
                    pattern: tag.pattern.slice(2, -2)
                });
            };

            var $tag = $("<li>", {
                'data-tag': tag.name,
                'class': "type-"+(tag.kind || "v"),
                'click': function(e) {
                    e.stopPropagation();

                    $tag.toggleClass("open");
                    if (!hasChildren) open();
                },
                'dblclick': open
            });

            var $span = $("<span>", {
                'text': tag.showName
            });
            $span.appendTo($tag);

            if (hasChildren) {
                $tags = $("<ul>", {
                    'class': "tags-tree"
                }).appendTo($tag);
                $("<i>", {
                    'class': "fa fa-angle-right tag-icon-close"
                }).prependTo($span);
                $("<i>", {
                    'class': "fa fa-angle-down tag-icon-open"
                }).prependTo($span);
            } else {
                $("<i>", {
                    'class': "fa fa-blank"
                }).prependTo($span);
            }
            
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

            _.chain(tags)
            .sortBy(function(tag) {
                return tag.name.length;
            })
            .each(function(tag) {
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
        updateTags: function(refresh) {
            var that = this, tree, path = box.activeFile;

            //Detach current tree
            _.each(this.$trees, function(_$tree) {
                _$tree.detach();
            });
            this.$treeContainer.empty();

            // No current file
            if (!path || path == "/") {
                var message = "No outline available for the current file.";
                this.$treeContainer.text(message);
                return Q.reject(message);
            }

            // No cache for the tags tree
            if (!this.$trees[path]) {
                this.$trees[path] = $("<ul>", {
                    'class': "tags-tree"
                });
                refresh = true;
            }

            // Add tags
            $tree = this.$trees[path];
            $tree.appendTo(this.$treeContainer);

            if (refresh !== true) return Q();
            return rpc.execute("codecomplete/get", {
                'file': path
            })
            .then(function(tags) {
                tree = that.convertTagsToTree(tags.results);

                var addChildren = function($parent, tags) {
                    _.each(tags, function(tag, name) {
                        var vTag = that.addTag(tag, $parent, _.size(tag.children) > 0);

                        addChildren(vTag.$children, tag.children);
                    });
                }
                addChildren($tree, tree);
            })
            .then(function() {
                that.ready();
            });
        },

        onClick: function() {
            this.$filterInput.focus();
        },
        onKeyup: function(e) {
            var query = this.$filterInput.val().toLowerCase();
            this.$("li").each(function() {
                $(this).toggle(!query || $(this).text().toLowerCase().indexOf(query) !== -1);
            });
        }
    });

    return PanelOutlineView;
});