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
            });

            this.tree.on("count", function(count) {
                console.log("count ", count);
                this.toggle(count > 0);
            }, this);
        },


        render: function() {
            this.$el.empty();
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