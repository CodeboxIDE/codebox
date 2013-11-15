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
            if (_.isArray(keys)) {
                _.each(keys, function(key) { Keyboard.bind(key, callback) });
                return;
            }
            if (this.bindings[keys] == null) {
                this.bindings[keys] = new hr.Class();
                Mousetrap.bind(keys, _.bind(function(e) {
                    this.bindings[keys].trigger("action", e);
                }, this));
            }
            this.bindings[keys].on("action", callback, context);
            return;
        },
    }));
    return Keyboard;
});