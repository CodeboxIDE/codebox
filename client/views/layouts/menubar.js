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
            "click .menu-action-open-root": "actionOpenRoot"
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

        // (action) Open root directory
        actionOpenRoot: function(e) {
            e.preventDefault();

            session.trigger("openFile", {
                'path': '/package.json'
            });
        }
    });

    // Register as template component
    hr.View.Template.registerComponent("layout.menubar", MenuBarView);

    return MenuBarView;
});