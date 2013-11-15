define([
    "underscore",
    "jQuery",
    "hr/hr",
    "core/box",
    "core/commands",
    "utils/dialogs"
], function(_, $, hr, box, commands, Dialogs) {

    var LateralBarView = hr.View.extend({
        className: "layout-lateralbar",
        template: "lateralbar/main.html",
        defaults: {},
        events: {
            "click .menu-action-search": "toggleSearch",
            "click .menu-action-open-root": "actionOpenRoot",
            "click .menu-action-open-terminal": "actionOpenTerminal"
        },

        // Constructor
        initialize: function(options) {
            LateralBarView.__super__.initialize.apply(this, arguments);
            var that = this;
            
            // Search command
            commands.register("search", {
                title: "Search",
                icon: "search",
                shortcuts: [
                    "s", "/"
                ]
            }, function() {
                that.toggleSearch(true);
            });

            return this;
        },

        // Finish rendering
        finish: function() {
            this.$(".menu-bottom .menu-item a").tooltip({
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

        // (action) Toggle search
        toggleSearch: function(st, query) {
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