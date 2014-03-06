define([
    'hr/promise',
    'hr/utils',
    'hr/hr',
    'models/command',
    'core/search'
], function(Q, _, hr, Command, search) {
    // Search for commands
    search.handler({
        'id': "commands",
        'title': "Command"
    }, function(query) {
        return Command.all.filter(function(command) {
            return (
                command.get("type") == "action"
                && !command.hasFlag("disabled")
                && (!query || command.textScore(query) > 0)
            );
        });
    });
});