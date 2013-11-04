define([
    "Underscore",
    "hr/hr"
], function(_, hr) {
    var logging = hr.Logger.addNamespace("command");

    var Command = hr.Model.extend({
        defaults: {
            'id': "",
            'title': "",
            'icon': "sign-blank",
            'handler': function() {},
            'popover':  null,

            // Options
            'visible': true,   // Visible in lateral bar
            'search': true,    // Visible in search
        },

        // Run the command
        run: function(args) {
            return this.get("handler").apply(this, [args]);
        }
    });

    return Command;
});