define([
    "underscore",
    "hr/hr"
], function(_, hr) {
    var logging = hr.Logger.addNamespace("command");

    var Command = hr.Model.extend({
        defaults: {
            'id': "",
            'title': "",
            'icon': "sign-blank",
            'handler': function() {},

            // Options
            'shortcuts': [],
            'visible': true,   // Visible in lateral bar
            'search': true,    // Visible in search,
            'flags': ""        // Command class flag
        },

        // Run the command
        run: function(args) {
            return this.get("handler").apply(this, [args]);
        }
    });

    return Command;
});