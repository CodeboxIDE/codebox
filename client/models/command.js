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
            'handler': function() {}
        },

        // Run the command
        run: function() {
            return this.get("handler").apply(this, arguments);
        }
    });

    return Command;
});