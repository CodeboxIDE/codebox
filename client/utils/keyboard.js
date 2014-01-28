define([
    'hr/hr',
    'underscore',
    'vendors/mousetrap'
], function (hr, _, Mousetrap) {
    var Keyboard = new (hr.Class.extend({
        /*
         *  Initialize the keyboard navigation
         */
        initialize: function() {
            this.bindings = {};
            return this;
        },

        /*
         *  Handle manually a keyboard event
         */
        handleKeyEvent: function(e) {
            e.mousetrap = true;
            return Mousetrap.handleKeyEvent(e);
        },

        /*
         *  Bind keyboard shortcuts to callback
         *  @keys : shortcut or list of shortcuts
         *  @callback : function to call
         */
        bind: function(keys, callback, context) {
            // List of shortcuts for same action
            if (_.isArray(keys)) {
                _.each(keys, function(key) { this.bind(key, callback) }, this);
                return;
            }

            // Map shortcut -> action
            if (_.isObject(keys)) {
                _.each(keys, function(method, key) {
                    this.bind(key, method);
                }, this)
                return;
            }

            // Bind
            if (this.bindings[keys] == null) {
                this.bindings[keys] = new hr.Class();
                Mousetrap.bind(keys, _.bind(function(e) {
                    this.bindings[keys].trigger("action", e);
                }, this));
            }
            this.bindings[keys].on("action", callback, context);
            return;
        },

        /*
         *  Convert shortcut or list of shortcut to a string
         */
        toText: function(shortcut) {
            if (_.isArray(shortcut)) shortcut = _.first(shortcut);
            if (!shortcut) return null;

            // Replace mod by equivalent for mac or windows
            shortcut = shortcut.replace("mod", /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '&#8984;' : 'ctrl');

            // Replace ctrl
            shortcut = shortcut.replace("ctrl", "⌃");

            // Replace shift
            shortcut = shortcut.replace("shift", "⇧");

            // Replace +
            shortcut = shortcut.replace(/\+/g, " ");

            return shortcut.toUpperCase();
        }
    }));
    return Keyboard;
});