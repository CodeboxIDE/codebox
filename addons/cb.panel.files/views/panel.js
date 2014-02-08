define([
    "settings",
    "views/tree",
    "views/list",
    "text!templates/panel.html",
    "less!stylesheets/panel.less"
], function(panelSettings, FilesTreeView, FilesListView, templateFile) {
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
        templateLoader: "text",
        template: templateFile,

        initialize: function() {
            PanelFilesView.__super__.initialize.apply(this, arguments);

            this.listActive = new FilesListView({
                collection: files.active
            });

            this.tree = new FilesTreeView({
                model: box.root
            });
            this.tree.update();

            this.tree.on("count", function(count) {
                this.toggle(count > 0);
            }, this);

            this.listActive.on("add remove filter", function(item, state) {
                this.$(".files-section-open").toggle(panelSettings.user.get("openfiles") && this.listActive.count() > 0);
            }, this);

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
            this.listActive.$el.detach();

            return PanelFilesView.__super__.render.apply(this, arguments);
        },

        finish: function() {
            this.toggle(this.tree.countFiles > 0);

            if (panelSettings.user.get("openfiles")) {
                this.listActive.$el.appendTo(this.$(".files-section-open .section-content"));
                this.$(".files-section-open").toggle(this.listActive.count() > 0);
            } else {
                this.$(".files-section-open").hide();
            }
            
            this.tree.$el.appendTo(this.$(".files-section-tree .section-content"));

            return PanelFilesView.__super__.finish.apply(this, arguments);
        },
    });

    return PanelFilesView;
});