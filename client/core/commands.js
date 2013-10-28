define([
    'Underscore',
    'hr/hr',
    'collections/commands',
    'core/search'
], function (_, hr, Commands, search) {
    // Collection for all current commands
    var commands = new Commands();

    // Add commands to search
    search.handler("commands", function(query) {
        return _.map(commands.filter(function(command) {
            return (
                command.get("title").toLowerCase().indexOf(query) != -1
                && command.get("search")
            );
        }), function(command) {
            return {
                "text": command.get("title"),
                "callback": _.bind(function() {
                    command.run();
                }, this)
            }
        });
    });

    return commands;
});