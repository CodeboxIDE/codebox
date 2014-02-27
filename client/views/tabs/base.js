define([
    "hr/utils",
    "hr/dom",
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
            "alt+w": "closeTab",
            "alt+shift+tab": "tabGotoPrevious",
            "alt+tab": "tabGotoNext"
        },

        // Menu title
        menuTitle: "Tab",


        // Constructor
        initialize: function() {
            TabPanelView.__super__.initialize.apply(this, arguments);
            var menu = require("core/commands/menu");

            this.tabs = this.parent;
            this.tab = this.options.tab;

            // Create tab menu
            this.menu = new Command({}, {
                'type': "menu",
                'title': this.menuTitle,
                'position': 1
            });
            this.on("tab:state", function(active) {
                this.menu.toggleFlag("hidden", !active);
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
            //this.tabs.close(this.tabid, force);
        },

        // Open the tab
        openTab: function(e) {
            //this.tabs.open(this.tabid);
        },

        // Set tab title
        setTabTitle: function(t) {
            //this.tab.set("title", t);
            return this;
        },

        // Set tab state
        setTabState: function(state, value) {
            var states = (this.tab.get("state") || "").split(" ");

            if (value == null)  state = !_.contains(states, state);
            if (value) {
                states.push(state);
            } else {
                states = _.without(states, state);
            }
            this.tab.set("state", _.uniq(states).join(" "));
            return this;
        },

        // Set tab title
        setTabId: function(t) {
            //this.tabs.tabs[this.tabid].uniqueId = t;
            return this;
        },

        // Return if is active
        isActiveTab: function() {
            /*var active = this.tabs.getCurrentTab();
            return !(active == null || active.tabid != this.tabid);*/
            return false;
        },

        // Check that tab can be closed
        tabCanBeClosed: function() {
            return true;
        },

        // Goto
        tabGotoPrevious: function(e) {
            if (e) e.preventDefault();
            /*var that = this;
            setTimeout(function() {
                that.tabs.open(that.tabs.getPreviousTab(that.tabid));
            }, 0);*/
        },
        tabGotoNext: function(e) {
            if (e) e.preventDefault();
            /*var that = this;
            setTimeout(function() {
                that.tabs.open(that.tabs.getNextTab(that.tabid));
            }, 0);*/
        }
    });

    return TabPanelView;
});