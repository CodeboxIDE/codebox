define([
    'underscore',
    'jQuery',
    'hr/hr',
    'models/command',
    'views/panels/base'
], function(_, $, hr, Command, PanelBaseView) {
    var PanelsView = hr.View.extend({
        className: "cb-panels-list",
        defaults: {},
        events: {},

        // Constructor
        initialize: function(options) {
            PanelsView.__super__.initialize.apply(this, arguments);

            // Active panel
            this.activePanel = null;
            this.previousPanel = null;

            // Command view menu
            this.command = new Command({}, {
                'type': "menu",
                'title': "Panel"
            });

            // Panels map
            this.panels = {};

            return this;
        },

        // Register a new panel
        register: function(panelId, panelView, constructor, options) {
            constructor = _.extend(constructor || {}, {
                'panel': panelId
            });

            this.panels[panelId] = new panelView(constructor, this);

            this.panels[panelId].$el.appendTo(this.$el);
            this.panels[panelId].$el.hide();
            this.panels[panelId].render();

            return this.panels[panelId];
        },

        // Render
        render: function() {
            this.$el.empty();
            _.each(this.panels, function(panel, panelId) {
                panel.$el.appendTo(this.$el);
                panel.render();
            }, this);

            return this.ready();
        },

        // Open a panel
        open: function(pId) {
            var opened = false;
            _.each(this.panels, function(panel, panelId) {
                opened = opened || (panelId == pId);

                // Change visibility of the panel
                panel.$el.toggle(panelId == pId);

                // Trigger panel event
                if (panelId != pId && panelId == this.activePanel) {
                    panel.trigger("panel:close");
                } else if (panelId == pId) {
                    panel.trigger("panel:open");
                }
            }, this);

            // Change active panel
            this.previousPanel = this.activePanel || this.previousPanel;
            this.activePanel = pId;

            // Trigger global event
            if (opened) {
                this.trigger("open", pId);
            } else {
                this.trigger("close");
            }

            return this;
        },

        // Close panel
        close: function() {
            return this.open(null);
        },

        // Is active
        isActive: function(pId) {
            return this.activePanel == pId;
        },

        // Show panels
        show: function() {
            return this.open(this.activePanel || this.previousPanel || _.first(_.keys(this.panels)));
        }
    });

    return PanelsView;
});