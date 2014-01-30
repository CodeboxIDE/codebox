define([
    'autorun'
], function(autorun) {
    var _ = codebox.require("underscore");
    var operations = codebox.require("core/operations");
    var box = codebox.require("core/box");
    var dialogs = codebox.require("utils/dialogs");
    var alerts = codebox.require("utils/alerts");
    var Command = codebox.require("models/command");

    // Run commands
    var runCommands = new Command({}, {
        'id': "run.commands",
        'title': "Run Project",
        'type': "menu",
        'offline': false,
        'position': 1,
        'shortcuts': [
            "alt+r"
        ]
    });

    // Update runner list
    var updateList = function() {
        return box.runner().then(function(runner) {
            runCommands.menu.reset(_.map(runner, function(_runner) {
                return {
                    'title': _runner.name,
                    'action': function() {
                        autorun.command.run({
                            'id': _runner.id
                        });
                    }
                };
            }));

            return ports;
        });
    };

    return {
        'command': runCommands,
        'update': updateList
    }
});