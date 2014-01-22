define([
    "underscore",
    "jQuery",
    "hr/hr",
    "utils/dragdrop",
    "utils/keyboard",
    "utils/contextmenu",
    "models/command"
], function(_, $, hr, DragDrop, Keyboard, ContextMenu, Command) {
    // Tab body view
    var TabPanelView = hr.View.extend({
        className: "component-tab-panel",
        events: {
            "click": "openTab"
        },

        // Keyboard shortcuts inside the tab
        shortcuts: {
            "mod+shift+c": "closeTab"
        },

        // Menu title
        menuTitle: "Tab",


        // Constructor
        initialize: function() {
            TabPanelView.__super__.initialize.apply(this, arguments);
            var menu = require("core/commands/menu");

            this.tabid = this.options.tabid;
            this.tabs = this.parent;

            // Create tab menu
            this.menu = new Command({}, {
                'type': "menu",
                'title': this.menuTitle,
                'position': 1
            });
            this.on("tab:state", function(active) {
                this.menu.toggleFlag("disabled", !active);
            }, this);
            this.on("tab:close", function() {
                this.menu.destroy();
            }, this);
            menu.collection.add(this.menu);

            // Keyboard shortcuts
            this.setShortcuts(this.shortcuts || {});
            return this;
        },

        // Define keyboard shortcuts
        setShortcuts: function(navigations, container) {
            var navs = {};
            container = container || this;

            _.each(navigations, function(method, key) {
                navs[key] = _.bind(function() {
                    // Trigger only if active tab
                    if (!this.isActiveTab()) return;

                    // Get method
                    if (!_.isFunction(method)) method = container[method];

                    // Apply method
                    if (!method) return;
                    method.apply(container, arguments);
                }, this);
            }, this);
            
            Keyboard.bind(navs);
        },

        // Close the tab
        closeTab: function(e, force) {
            if (e != null) e.preventDefault();
            this.tabs.close(this.tabid, force);
        },

        // Open the tab
        openTab: function(e) {
            this.tabs.open(this.tabid);
        },

        // Set tab title
        setTabTitle: function(t) {
            this.tabs.tabs[this.tabid].title = t;
            this.tabs.tabs[this.tabid].tab.update();
            return this;
        },

        // Set tab state
        setTabState: function(state, value) {
            var states = (this.tabs.tabs[this.tabid].state || "").split(" ");

            if (value == null)  state = !_.contains(states, state);
            if (value) {
                states.push(state);
            } else {
                states.remove(state);
            }
            this.tabs.tabs[this.tabid].state = _.uniq(states).join(" ");
            this.tabs.tabs[this.tabid].tab.update();
            return this;
        },

        // Set tab title
        setTabId: function(t) {
            this.tabs.tabs[this.tabid].uniqueId = t;
            return this;
        },

        // Set tab type
        setTabType: function(t) {
            this.tabs.tabs[this.tabid].type = t;
            return this;
        },

        // Return if is active
        isActiveTab: function() {
            var active = this.tabs.getCurrentTab();
            return !(active == null || active.tabid != this.tabid);
        },

        // Check that tab can be closed
        tabCanBeClosed: function() {
            return true;
        }
    });

    return TabPanelView;
});