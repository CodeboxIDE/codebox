define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "utils/dragdrop",
    "utils/keyboard",
    "utils/contextmenu",
    "models/command",
    "collections/commands"
], function(_, $, hr, DragDrop, Keyboard, ContextMenu, Command, Commands) {
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
            var statusbar = require("core/commands/statusbar");

            this.tabs = this.parent;
            this.tab = this.options.tab;

            // Create tab menu
            this.menu = new Command({}, {
                'type': "menu",
                'title': this.menuTitle,
                'position': 1
            });
            if (this.tab.manager.options.tabMenu) menu.collection.add(this.menu);

            // Create statusbar commands
            this.statusbar = new Commands();
            this.statusbar.pipe(statusbar.collection);

            // Bind tab event
            this.listenTo(this.tab.manager, "active", function(tab) {
                var state = tab.id == this.tab.id;

                this.trigger("tab:state", state);

                // Toggle visibility of commands
                this.menu.toggleFlag("hidden", !state);
                this.statusbar.each(function (command){
                    command.toggleFlag("hidden", !state);
                });
            });
            this.on("tab:close", function() {
                this.menu.destroy();
                this.statusbar.stopListening();
                this.statusbar.each(function (command){
                    command.destroy();
                });
            }, this);

            // Keyboard shortcuts
            this.setShortcuts(this.shortcuts || {});
            return this;
        },

        // Define keyboard shortcuts
        setShortcuts: function(navigations, container) {
            var navs = {};
            container = container || this;

            if (!this.tab.manager.options.keyboardShortcuts) return;

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
            this.tab.close(force);
        },

        // Open the tab
        openTab: function(e) {
            this.tab.active();
        },

        // Set tab title
        setTabTitle: function(t) {
            this.tab.set("title", t);
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
            this.tab.set("id", t);
            return this;
        },

        // Return if is active
        isActiveTab: function() {
            return this.tab.manager.isActiveTab(this.tab);
        },

        // Check that tab can be closed
        tabCanBeClosed: function() {
            return true;
        },

        // Goto
        tabGotoPrevious: function(e) {
            if (e) e.preventDefault();
            var that = this;
            setTimeout(function() {
                var p = that.tab.prevTab();
                if (p) p.active();
            }, 0);
        },
        tabGotoNext: function(e) {
            if (e) e.preventDefault();
            var that = this;
            setTimeout(function() {
                var p = that.tab.nextTab();
                if (p) p.active();
            }, 0);
        }
    });

    return TabPanelView;
});