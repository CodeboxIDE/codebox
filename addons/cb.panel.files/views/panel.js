define([
    "settings",
    "views/tree",
    "less!stylesheets/panel.less"
], function(panelSettings, FilesTreeView) {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
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

            this.tree = new FilesTreeView.Item({
                model: box.root
            }, this);
            this.tree.update();
            this.tree.select();


            var $rootTree = $("<ul>", {
                "class": "root-tree cb-files-tree"
            });
            $rootTree.appendTo(this.$el);
            this.tree.$el.appendTo($rootTree);

            // Offline
            hr.Offline.on("state", function() {
                this.update();
            }, this);

            // Settings update
            panelSettings.user.change(function() {
                this.update();
            }, this);

            this.on("tab:layout", function() {
                //this.render();
            }, this);

            // Context menu
            ContextMenu.add(this.$el, box.root.contextMenu());
        },

        render: function() {
            return this.ready();
        }
    });

    return PanelFilesView;
});