define([
    "less!stylesheets/panel.less"
], function() {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var collaborators = codebox.require("core/collaborators");
    var PanelBaseView = codebox.require("views/panels/base");

    var PanelCollaboratorsView = PanelBaseView.extend({
        className: "cb-panel-collaborators",
        templateLoader: "addon.cb.panel.collaborators.templates",
        template: "panel.html",
        events: {

        },

        initialize: function() {
            PanelCollaboratorsView.__super__.initialize.apply(this, arguments);
            collaborators.on("add remove reset change", this.update, this);
        },
    });

    return PanelCollaboratorsView;
});