define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "codebox/box"
], function(_, $, hr, Codebox) {

    var MenuBarView = hr.View.extend({
        className: "layout-menubar",
        template: "layouts/menubar.html",
        defaults: {},
        events: {},

        // Finish rendering
        finish: function() {
            this.$(".menu-item").tooltip({
                'placement': 'right',
                'delay': {
                    'show': 600,
                    'hide': 0
                }
            });

            return MenuBarView.__super__.finish.apply(this, arguments);
        }
    });

    // Register as template component
    hr.View.Template.registerComponent("layout.menubar", MenuBarView);

    return MenuBarView;
});