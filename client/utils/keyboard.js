define([
    'hr/hr',
    'vendors/mousetrap'
], function (hr, Mousetrap) {
    var Keyboard = new (hr.Class.extend({
        /*
         *  Initialize the keyboard navigation
         */
        initialize: function() {
            this.bindings = {};
            return this;
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
            console.log("bind ", keys);
            this.bindings[keys].on("action", callback, context);
            return;
        },
    }));
    return Keyboard;
});