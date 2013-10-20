define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "session"
], function(_, $, hr, session) {

    var MenuBarView = hr.View.extend({
        className: "layout-menubar",
        template: "layouts/menubar.html",
        defaults: {},
        events: {
            "click a[data-menuaction]": "menuAction"
        },

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
        },

        // Menu action
        menuAction: function(e) {
            e.preventDefault();

            var action = $(e.currentTarget).data("menuaction");
            session.trigger("open", {
                'type': action
            });
        }
    });

    // Register as template component
    hr.View.Template.registerComponent("layout.menubar", MenuBarView);

    return MenuBarView;
});