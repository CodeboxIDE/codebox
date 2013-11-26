define([
    'underscore',
    'hr/hr',
    'views/commands/manager',
    'core/search'
], function (_, hr, CommandsView, search) {
    // Collection for all current commands
    var commands = new CommandsView();

    // Add commands to search
    search.handler({
        'id': "commands",
        'title': "Commands"
    }, function(query) {
        return _.map(commands.collection.filter(function(command) {
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