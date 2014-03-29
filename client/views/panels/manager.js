define([
    'hr/utils',
    'hr/dom',
    'hr/hr',
    'models/command',
    'views/tabs/manager',
    'views/panels/base',
    'views/panels/file'
], function(_, $, hr, Command, TabsManager) {
    /**
     * Manager view for panels
     *
     * @class
     * @constructor
     */
    var PanelsView = hr.View.extend({
        className: "cb-panels",
        defaults: {},
        events: {},

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

            // Menu of panels choice
            this.panelsCommand = new Command({}, {
                'type': "menu",
                'title': "Panels"
            });

            // Panels map
            this.panels = {};

            return this;
        },

        render: function() {
            return this.ready();
        },

        /**
         * Register a new panel
         *
         * @property {string} panelId unique id to identify the panel
         * @property {PanelBaseView} panelView view constructor for this panel
         * @property {object} constructor options for construction of the panel view
         * @return {PanelBaseView} panel just created
         */
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

        /**
         * Open a panel by its id
         *
         * @property {string} pId unique id to identify the panel to open
         */
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
            this.activePanel = pId;
            
            if (opened) {
                this.trigger("open", pId);
            } else {
                this.trigger("close");
            }

            return this;
        },

        /**
         * Check the visibility of a specific panel
         *
         * @property {string} pId unique id to identify the panel
         */
        isActive: function(pId) {
            var t = this.tabs.getById(pId);
            return !(t == null || !t.isActive());
        },

        /**
         * Close a panel
         *
         * @property {string} pId unique id to identify the panel
         */
        close: function(pId) {
            var tab = this.tabs.getById(pId);
            if (tab) tab.close();
        }
    });

    return PanelsView;
});