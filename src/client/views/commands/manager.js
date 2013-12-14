define([
    "hr/hr",
    "collections/commands",
    "utils/keyboard"
], function(hr, Commands, Keyboard) {
    var logging = hr.Logger.addNamespace("commands");

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
            logging.log("register", id, properties);

            properties = _.extend({}, properties, {
                'id': id,
                'action': actionHandler
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
    });

    return CommandsView;
});