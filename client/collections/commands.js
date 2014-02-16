define([
    "hr/utils",
    "hr/hr",
    "models/command"
], function(_, hr, Command) {
    var Commands = hr.Collection.extend({
        model: Command,

        // Sort comparator
        comparator: function(command) {
            return command.get("position", 2);
        }
    });

    return Commands;
});