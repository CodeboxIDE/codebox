define([
    "hr/utils",
    "hr/hr",
    "models/command"
], function(_, hr, Command) {
    var logging = hr.Logger.addNamespace("operations");

    var Operation = Command.extend({
        defaults: _.extend({}, Command.prototype.defaults, {
            "type": "operation",
            
            // Id for the operation
            "id": null,

            // Title to display instead of the id
            "title": null,

            // (int) Progress
            'progress': null,

            // Icon to show
            'icons': {
                'default': "fa-refresh fa-spin",
            },

            // State
            'state': 'running', // 'idle', 'running'
        }),

        // Update progress
        progress: function(p) {
            this.set("progress", p);
            return this;
        },

        // Set state
        state: function(st) {
            this.set("state", st);
            return this;
        }
    });

    return Operation;
});