define([
    "hr/hr",
    "collections/commands",
    "utils/keyboard",
    "views/commands/item"
], function(hr, Commands, Keyboard, CommandItem) {
    var logging = hr.Logger.addNamespace("commands");

    // Commands list
    var CommandsView = hr.List.extend({
        className: "cb-menu-commands",
        Collection: Commands,
        Item: CommandItem,

        /*
         *  Register a new command
         *
         *  id: unique id for the command
         *  properties: properties to define the command
         *  handler: command handler
         */
        register: function(id, properties, handler) {
            logging.log("register", id, properties);

            properties = _.extend({}, properties, {
                'id': id,
                'handler': handler
            });

            var command = new this.collection.model({}, properties);
            this.collection.add(command);

            // Bind keyboard shortcuts
            _.each(command.get("shortcuts", []), function(shortcut) {
                Keyboard.bind(shortcut, function(e) {
                    e.preventDefault();
                    command.run();
                });
            });

            return command;
        },

        /*
         *  Run a command
         *
         *  commandId: unique id of the command to run
         */
        run: function(commandId) {
            var command = this.collection.find(function(command) {
                return command.get("id") == commandId;
            });
            if (!command) return false;
            return command.run.apply(command, Array.prototype.slice.call(arguments, 1));
        }
    });

    return CommandsView;
});