define([
    "Underscore",
    "hr/hr",
    "models/command"
], function(_, hr, Command) {
    var logging = hr.Logger.addNamespace("command");

    var Commands = hr.Collection.extend({
        model: Command,

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

            var command = new this.model({}, properties);
            this.add(command);

            return command;
        },

        /*
         *  Run a command
         *
         *  commandId: unique id of the command to run
         */
        run: function(commandId) {
            var command = this.find(function(command) {
                return command.get("id") == commandId;
            });
            if (!command) return false;
            return command.run.apply(command, Array.prototype.slice.call(arguments, 1));
        }
    });

    return Commands;
});