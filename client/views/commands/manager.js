define([
    "hr/hr",
    "models/command",
    "collections/commands",
    "utils/keyboard"
], function(hr, Command, Commands, Keyboard) {

    var CommandItem = hr.List.Item.extend({
        flagsClasses: {
            'active': "active",
            'disabled': "disabled",
            "hidden": "hidden"
        },

        getFlagsClass: function() {
            return _.map(this.model.get("flags", "").split(" "), function(flag) {
                return this.flagsClasses[flag] || "";
            }, this).join(" ");
        }
    });

    // Commands list
    var CommandsView = hr.List.extend({
        Collection: Commands,

        /*
         *  Register a new command
         *
         *  id: unique id for the command
         *  properties: properties to define the command
         *  handler: command handler
         */
        register: function(id, properties, actionHandler) {
            properties = _.extend({}, properties, {
                'id': id,
                'action': actionHandler
            });

            var command = Command.register(properties);
            this.collection.add(command);

            return command;
        },

        /*
         *  Return a command by its id
         */
        getById: function(commandId) {
            return this.collection.find(function(command) {
                return command.id == commandId;
            });
        },

        /*
         *  Run a command
         *
         *  commandId: unique id of the command to run
         */
        run: function(commandId) {
            var command = this.getById(commandId);
            if (!command) return false;
            return command.run.apply(command, Array.prototype.slice.call(arguments, 1));
        }
    }, {
        CommandItem: CommandItem
    });

    return CommandsView;
});