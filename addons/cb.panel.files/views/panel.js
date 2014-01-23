define([
    "views/tree",
    "views/list",
    "less!stylesheets/panel.less"
], function(FilesTreeView, FilesListView) {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var box = codebox.require("core/box");
    var files = codebox.require("core/files");
    var search = codebox.require("core/search");
    var ContextMenu = codebox.require("utils/contextmenu");
    var PanelBaseView = codebox.require("views/panels/base");

    var PanelFilesView = PanelBaseView.extend({
        className: "cb-panel-files",

        initialize: function() {
            PanelFilesView.__super__.initialize.apply(this, arguments);

            this.treeActive = new FilesListView({
                collection: files.active
            });

            this.tree = new FilesTreeView({
                path: "/"
            });

            this.tree.on("count", function(count) {
                this.toggle(count > 0);
            }, this);

            hr.Offline.on("state", function() {
                this.update();
            }, this);
        },


        render: function() {
            this.$el.empty();

            // Context menu
            ContextMenu.add(this.$el, box.root.contextMenu());

            this.treeActive.$el.appendTo(this.$el);
            this.treeActive.render();

            this.tree.$el.appendTo(this.$el);
            this.tree.render();
            return this.ready();
        },

        finish: function() {
            this.toggle(this.tree.countFiles > 0);
            return PanelFilesView.__super__.finish.apply(this, arguments);
        },
    });

    return PanelFilesView;
});