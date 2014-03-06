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
                // Only action
                command.get("type") == "action"

                // Accept to be visible in search bar
                && command.get("search")

                // Not disabled (offline, ...)
                && !command.hasFlag("disabled")

                // Fit the current search
                && (!query || command.textScore(query) > 0)
            );
        });
    });
});