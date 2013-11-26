define([
    "views/tree",
    "less!stylesheets/panel.less"
], function(FilesTreeView) {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var search = codebox.require("core/search");
    var PanelBaseView = codebox.require("views/panels/base");

    var PanelFilesView = PanelBaseView.extend({
        className: "cb-panel-files",

        initialize: function() {
            PanelFilesView.__super__.initialize.apply(this, arguments);
            this.tree = new FilesTreeView({
                path: "/"
            })
        },


        render: function() {
            this.$el.empty();
            this.tree.$el.appendTo(this.$el);
            this.tree.render();
            return this.ready();
        }
    });

    return PanelFilesView;
});