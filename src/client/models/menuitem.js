define([
    "underscore",
    "hr/hr"
], function(_, hr) {
    var MenuItem = hr.Model.extend({
        defaults: {
            // menu item type: "divider", "action", "submenu"
            'type': "divider",

            // text for the item
            'text': "",

            // onclick action
            'action': function() {},

            // associated commmand
            'command': null
        },

        // handle a click
        run: function(arg) {
            var command = this.get("command");
            if (command) {
                var commands = require("core/commands");
                commands.run(command);
            } else {
                this.get("action")(arg);
            }
        }
    });

    return MenuItem;
});