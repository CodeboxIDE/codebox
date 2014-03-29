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
    /**
     * Tab body base view
     *
     * @class
     * @constructor
     */
    var TabPanelView = hr.View.extend({
        className: "component-tab-panel",
        events: {
            "click": "openTab"
        },

        /**
         * Keyboard shortcuts inside the tab
         */
        shortcuts: {
            "alt+w": "closeTab",
            "alt+shift+tab": "tabGotoPrevious",
            "alt+tab": "tabGotoNext"
        },

        /**
         * Title in the menu bar
         */
        menuTitle: "Tab",

        initialize: function() {
            TabPanelView.__super__.initialize.apply(this, arguments);

            var menu = require("core/commands/menu");
            var statusbar = require("core/commands/statusbar");

            this.tabs = this.parent;
            this.tab = this.options.tab;

            /**
             * Menu for this tab in the menu bar
             * @property
             */
            this.menu = new Command({}, {
                'type': "menu",
                'title': this.menuTitle,
                'position': 1
            });
            if (this.tab.manager.options.tabMenu) menu.collection.add(this.menu);

            /**
             * Collection of commands for this tab in the statusbar
             * @property
             */
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

        /**
         * Define (add) new keyboard shortcuts
         *
         * @param {object} navigations map of keyboard shortcut -> method
         * @param {object} [container] object to get method from if the method is a string 
         */
        setShortcuts: function(navigations, container) {
            var navs = {};
            container = container || this;

            if (!this.tab.manager.options.keyboardShortcuts) return;

            _.each(navigations, function(method, key) {
                navs[key] = function() {
                    // Trigger only if active tab
                    if (!this.isActiveTab()) return;

                    // Get method
                    if (!_.isFunction(method)) method = container[method];

                    // Apply method
                    if (!method) return;
                    method.apply(container, arguments);
                };
            }, this);
            
            Keyboard.bind(navs, this);
        },

        /**
         * Close this tab
         */
        closeTab: function(e, force) {
            if (e != null) e.preventDefault();
            this.tab.close(force);
        },

        /**
         * Set this tab as active
         */
        openTab: function(e) {
            this.tab.active();
        },

        /**
         * Set tab title
         *
         * @param {string} title new title to set
         */
        setTabTitle: function(title) {
            this.tab.set("title", title);
            return this;
        },

        /**
         * Set a tab state, states are used to signal
         * for example that the file is loading, ...
         *
         * @param {string} state state id to define
         * @param {boolean} value value for this state
         */
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

        /**
         * Set tab id
         *
         * @param {string} id new id for this tab
         */
        setTabId: function(id) {
            this.tab.set("id", id);
            return this;
        },

        /**
         * Check if the tab is active
         *
         * @return {boolean}
         */
        isActiveTab: function() {
            return this.tab.manager.isActiveTab(this.tab);
        },

        /**
         * Check if the tab can be closed,
         * this method can be overided
         *
         * @return {boolean}
         */
        tabCanBeClosed: function() {
            return true;
        },

        // Navigation between tabs
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