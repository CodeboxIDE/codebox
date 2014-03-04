define([
    'hr/utils',
    'hr/hr',
    'views/commands/toolbar',
    'core/search',
], function (_, hr, CommandsToolbar, search) {
    // Collection for all toolbar commands
    var commands = new CommandsToolbar();

    // Add commands to search
    /*search.handler({
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
    });*/

    return commands;
});