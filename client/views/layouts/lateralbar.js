define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "session"
], function(_, $, hr, session) {

    var LateralBarView = hr.View.extend({
        className: "layout-lateralbar",
        template: "layouts/lateralbar.html",
        defaults: {},
        events: {
            "click .menu-action-search": "toggleSearch",
            "click .menu-action-open-root": "actionOpenRoot",
            "click .menu-action-open-terminal": "actionOpenTerminal"
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

            session.codebox.root.open();
        },

        // (action) Open terminal
        actionOpenTerminal: function(e) {
            e.preventDefault();

            session.codebox.trigger("openTerminal");
        },

        toggleSearch: function(st, query) {
            if (!_.isBoolean(st)) {
                st.preventDefault();
                st = undefined;
            }

            this.$el.toggleClass("mode-search", st);
            if (!this.$el.hasClass("mode-search")) query = "";
            if (query != null) this.$(".search-query").val(query);
        }
    });

    // Register as template component
    hr.View.Template.registerComponent("layout.lateralbar", LateralBarView);

    return LateralBarView;
});