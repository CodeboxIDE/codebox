define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "codebox/box"
], function(_, $, hr, Codebox) {

    var LateralBarView = hr.View.extend({
        className: "layout-lateralbar",
        template: "layouts/lateralbar.html",
        defaults: {},
        events: {}
    });

    // Register as template component
    hr.View.Template.registerComponent("layout.lateralbar", LateralBarView);

    return LateralBarView;
});