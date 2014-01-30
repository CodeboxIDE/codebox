define([
    'runner',
    'ports',
    'autorun'
], function(runner, ports, autorun) {
    var _ = codebox.require("underscore");
    var operations = codebox.require("core/operations");
    var app = codebox.require("core/app");
    var box = codebox.require("core/box");
    var menu = codebox.require("core/commands/menu");
    var dialogs = codebox.require("utils/dialogs");
    var alerts = codebox.require("utils/alerts");
    var Command = codebox.require("models/command");

    // Add menu
    menu.register("project", {
        title: "Project"
    }).menuSection([
        autorun.command,
        runner.command
    ]).menuSection([
        Command.register("project.build", {
            'title': "Build",
            'offline': false,
            'action': function() {
                return autorun.command.run({
                    'type': "build"
                });
            },
            'shortcuts': [
                "mod+b"
            ]
        }),
        Command.register("project.clean", {
            'title': "Clean",
            'offline': false,
            'action': function() {
                return autorun.command.run({
                    'type': "clean"
                });
            },
            'shortcuts': [
                "mod+shift+k"
            ]
        })
    ]).menuSection([
        {
            'type': "action",
            'title': "Refresh Ports",
            'offline': false,
            'action': ports.update
        },
        ports.command
    ]);

    // Updates list
    runner.update();
    ports.update();
});