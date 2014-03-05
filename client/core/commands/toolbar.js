define([
    'hr/utils',
    'hr/hr',
    'views/commands/toolbar',
    'core/search',
], function (_, hr, CommandsToolbar, search) {
    // Collection for all toolbar commands
    var commands = new CommandsToolbar();

    return commands;
});