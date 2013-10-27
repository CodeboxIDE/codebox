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
        }
    });

    return Commands;
});