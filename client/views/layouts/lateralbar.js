define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "session",
    "views/dialogs/utils"
], function(_, $, hr, session, Dialogs) {

    var LateralBarView = hr.View.extend({
        className: "layout-lateralbar",
        template: "layouts/lateralbar.html",
        defaults: {},
        events: {
            "click .menu-action-search": "toggleSearch",
            "click .menu-action-open-root": "actionOpenRoot",
            "click .menu-action-open-terminal": "actionOpenTerminal",
            "click .menu-action-open-settings": "actionOpenSettings"
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

            this.components.search.on("close", function() {
                this.toggleSearch(false);
            }, this);

            return LateralBarView.__super__.finish.apply(this, arguments);
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

        // (action) Open settings
        actionOpenSettings: function(e) {
            e.preventDefault();

            Dialogs.settings();
        },

        // (action) Toggle search
        toggleSearch: function(st, query) {
            if (!_.isBoolean(st)) {
                st.preventDefault();
                st = undefined;
            }

            this.$el.toggleClass("mode-search", st);

            st = this.$el.hasClass("mode-search");
            if (!st) {
                query = "";
                this.components.search.clearResults();
            } else {
                this.components.search.focus();
            }
            if (query != null) this.$(".search-query").val(query);
        }
    });

    // Register as template component
    hr.View.Template.registerComponent("layout.lateralbar", LateralBarView);

    return LateralBarView;
});