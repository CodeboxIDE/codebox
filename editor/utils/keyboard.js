var Class = require("hr.class");
var _ = require("hr.utils");

var Mousetrap = require("mousetrap");

var originalStopCallback = Mousetrap.prototype.stopCallback;
Mousetrap.prototype.stopCallback = function(e, element) {
    if (e.mousetrap) {
        return false;
    }
    return originalStopCallback.call(this, e, element);
};

var mousetrap = Mousetrap(document);

var Keyboard = Class.extend({
    initialize: function() {
        this.bindings = {};
        return this;
    },

    /*
     * Enable keyboard shortcut for a specific event
     */
    enableKeyEvent: function(e) {
        e.mousetrap = true;
    },

    /*
     * Bind keyboard shortcuts to callback
     */
    bind: function(keys, callback, context) {
        if (_.isArray(keys)) {
            _.each(keys, function(key) { this.bind(key, callback, context) }, this);
            return;
        }

        // Map shortcut -> action
        if (_.isObject(keys)) {
            _.each(keys, function(method, key) {
                this.bind(key, method, callback);
            }, this)
            return;
        }

        // Bind
        if (this.bindings[keys] == null) {
            this.bindings[keys] = new Class();
            mousetrap.bind(keys, _.bind(function(e) {
                this.bindings[keys].trigger("action", e);
            }, this));
        }
        context.listenTo(this.bindings[keys], "action", callback);
        return;
    },

    /*
     * Unbind keyboard shortcuts
     */
    unbind: function(keys, context, callback) {
        if (_.isArray(keys)) {
            _.each(keys, function(key) { this.unbind(key, context, callback) }, this);
            return;
        }

        if (!this.bindings[keys]) return;

        context.stopListening(this.bindings[keys], "action", callback);
        return;
    },

    /*
     * Prevent default browser shortcut
     */
    preventDefault: function(keys) {
        return this.bind(keys, function(e) {
            e.preventDefault();
        }, this);
    },

    /*
     * Convert shortcut or list of shortcut to a string
     */
    toText: function(shortcut) {
        if (_.isArray(shortcut)) shortcut = _.first(shortcut);
        if (!shortcut) return null;

        var isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

        // Replace mod by equivalent for mac or windows
        shortcut = shortcut.replace("mod", isMac ? '&#8984;' : 'ctrl');

        // Replace ctrl
        shortcut = shortcut.replace("ctrl", "⌃");

        // Replace shift
        shortcut = shortcut.replace("shift", "⇧");

        if (isMac) {
            shortcut = shortcut.replace("alt", "⌥");
        } else {
            shortcut = shortcut.replace("alt", "⎇");
        }

        // Replace +
        shortcut = shortcut.replace(/\+/g, " ");

        return shortcut.toUpperCase();
    }
});

var keyboard = new Keyboard();

// Prevent some browser default keyboard interactions
keyboard.preventDefault("mod+r");

module.exports = keyboard;
