define([
    "settings",
    "less!stylesheets/panel.less"
], function(panelSettings) {
    var _ = codebox.require("hr/utils");
    var Q = codebox.require("hr/promise");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");
    var ContextMenu = codebox.require("utils/contextmenu");
    var rpc = codebox.require("core/backends/rpc");
    var box = codebox.require("core/box");
    var files = codebox.require("core/files");

    var TagsView = hr.View.extend({
        className: "outline-file",
        events: {
            "click": "onClick",
            "keyup input": "onKeyup"
        },

        initialize: function() {
            TagsView.__super__.initialize.apply(this, arguments);
                
            this.$filterInput = $("<input>", {
                'type': "text",
                'class': "form-control input-sm",
                "placeholder": "Filter Tags"
            });
            this.$tree = $("<ul>", {
                'class': "tags-tree"
            });

            this.$filterInput.appendTo(this.$el);
            this.$tree.appendTo(this.$el);
        },

        render: function() {
            var that = this;

            return this.updateTags()
            .fail(function(err) {
                that.$tree.html("<div class='alert'>"+(err.message || err)+"</div>");
            })
            .fin(function() {
                that.ready();
            });
        },

        // Add tag
        addTag: function(tag, $parent, hasChildren) {
            var $tags, that = this;

            var open = function() {
                files.open(that.options.path, {
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
            var tagSeparator = panelSettings.user.get("separator");

            _.chain(tags)
            .sortBy(function(tag) {
                return tag.name.length;
            })
            .each(function(tag) {
                var parent = tree;
                var parts = tag.name.split(tagSeparator);
                var _name = _.last(parts);

                _.each(parts, function(part, i) {
                    if (parent[part]) {
                        parent = parent[part].children;
                    } else {
                        _name = parts.slice(i, parts.length).join(tagSeparator);
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
            var message = "No outline available for the current file.";
            var that = this, tree, path = this.options.path;

            // Clear tree
            this.$tree.empty();

            // No current file
            if (!path || path == "/") {
                return Q.reject(message);
            }

            return rpc.execute("codecomplete/get", {
                'file': path
            })
            .then(function(tags) {
                if (tags.results.length == 0) return Q.reject(message);
                tree = that.convertTagsToTree(tags.results);

                var addChildren = function($parent, tags) {
                    _.each(tags, function(tag, name) {
                        var vTag = that.addTag(tag, $parent, _.size(tag.children) > 0);

                        addChildren(vTag.$children, tag.children);
                    });
                }
                addChildren(that.$tree, tree);
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

    return TagsView;
});