define([
    'autorun'
], function(autorun) {
    var _ = codebox.require("hr/utils");
    var operations = codebox.require("core/operations");
    var box = codebox.require("core/box");
    var dialogs = codebox.require("utils/dialogs");
    var alerts = codebox.require("utils/alerts");
    var Command = codebox.require("models/command");

    // Run commands
    var runCommands = Command.register("project.run.action", {
        'category': "Project",
        'title': "Perform Action",
        'type': "menu",
        'offline': false,
        'search': false
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