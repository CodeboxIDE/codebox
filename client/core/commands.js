define([
    'hr/hr',
    'collections/commands'
], function (hr, Commands) {
    // Collection for all current commands
    var commands = new Commands();
    return commands;
});