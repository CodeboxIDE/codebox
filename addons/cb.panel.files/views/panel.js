define([
    "settings",
    "views/tree",
    "text!templates/panel.html",
    "less!stylesheets/panel.less"
], function(panelSettings, FilesTreeView, templateFile) {
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
        templateLoader: "text",
        template: templateFile,

        initialize: function() {
            PanelFilesView.__super__.initialize.apply(this, arguments);

            this.tree = new FilesTreeView.Item({
                model: box.root
            });
            this.tree.update();
            this.tree.select();

            // Offline
            hr.Offline.on("state", function() {
                this.update();
            }, this);

            // Settings update
            panelSettings.user.change(function() {
                this.update();
            }, this);

            // Context menu
            ContextMenu.add(this.$el, box.root.contextMenu());
        },

        render: function() {
            this.tree.$el.detach();

            return PanelFilesView.__super__.render.apply(this, arguments);
        },

        finish: function() {          
            this.tree.$el.appendTo(this.$(".root-tree"));

            return PanelFilesView.__super__.finish.apply(this, arguments);
        },
    });

    return PanelFilesView;
});