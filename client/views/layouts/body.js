define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "codebox/box",
    "views/tabs/file"
], function(_, $, hr, Codebox, FileTab) {

    var BodyView = hr.View.extend({
        className: "layout-body",
        template: "layouts/body.html",
        defaults: {},
        events: {},

        // Finish rendering
        finish: function() {
            this.components.tabs.add(FileTab);

            return BodyView.__super__.finish.apply(this, arguments);
        },
    });

    // Register as template component
    hr.View.Template.registerComponent("layout.body", BodyView);

    return BodyView;
});