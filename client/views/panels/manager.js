define([
    'hr/utils',
    'hr/dom',
    'hr/hr',
    'models/command',
    'views/panels/base',
    'views/tabs/manager'
], function(_, $, hr, Command, PanelBaseView, TabsManager) {

    var PanelsView = hr.View.extend({
        className: "cb-panels",
        defaults: {},
        events: {},

        // Constructor
        initialize: function(options) {
            var that = this;
            PanelsView.__super__.initialize.apply(this, arguments);

            // Tabs
            this.tabs = new TabsManager({
                layout: 1,
                layouts: {
                    "Columns: 1": 1
                },
                tabMenu: false,
                newTab: false,
                draggable: false,
                keyboardShortcuts: false,
                maxTabsPerSection: 1
            }, this);
            this.tabs.$el.appendTo(this.$el);

            // Active panel
            this.activePanel = null;
            this.previousPanel = null;

            // Menu of panels choice
            this.panelsCommand = new Command({}, {
                'type': "menu",
                'title': "Panels"
            });

            // Panels map
            this.panels = {};

            return this;
        },

        // Register a new panel
        register: function(panelId, panelView, constructor) {
            constructor = _.extend({
                'title': panelId
            }, constructor || {}, {
                'panel': panelId
            });

            this.panels[panelId] = new panelView(constructor, this);
            this.panels[panelId].update();

            return this.panels[panelId];
        },

        // Render
        render: function() {
            return this.ready();
        },

        // Open a panel
        open: function(pId) {
            var opened = false;

            if (pId && this.panels[pId]) {
                opened = true;
                var tab = this.tabs.add(TabsManager.Panel, {}, {
                    'title': this.panels[pId].options.title,
                    'uniqueId': pId
                });

                // If new tab
                if (tab.$el.is(':empty')) {
                    tab.once("tab:close", function() {
                        this.panels[pId].trigger("tab:close");
                        this.panels[pId].$el.detach();
                    }, this);

                    this.panels[pId].$el.appendTo(tab.$el);
                    this.panels[pId].update();
                }
            }

            this.previousPanel = this.activePanel || this.previousPanel;
            this.activePanel = pId;
            
            if (opened) {
                this.trigger("open", pId);
            } else {
                this.trigger("close");
            }

            return this;
        },

        // Check if a panel is active
        isActive: function(pId) {
            var t = this.tabs.getById(pId);
            return !(t == null || !t.isActive());
        },

        // Close panel
        close: function() {
            return this.open(null);
        },

        // Show panels
        show: function() {
            return this.open(this.activePanel || this.previousPanel || _.first(_.keys(this.panels)));
        }
    });

    return PanelsView;
});