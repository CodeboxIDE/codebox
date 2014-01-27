define(["views/dialog"], function(HelpDialog) {
    var app = codebox.require("core/app");
    var menu = codebox.require("core/commands/menu");
    var files = codebox.require("core/files");
    var rpc = codebox.require("core/backends/rpc");
    var dialogs = codebox.require("utils/dialogs");
    var Command = codebox.require("models/command");

    // Command open changelog
    var commandChanges = Command.register({
        'id': "help.changes",
        'title': "Open Changes",
        'action': function() {
            return rpc.execute("box/changes").then(function(changes) {
                return files.openNew("CHANGES", changes.content);
            });
        }
    });

    // Add menu
    menu.register("help", {
        title: "Help",
        position: 100
    }).menuSection([
        commandChanges,
        {
            'id': "help.documentation",
            'title': "Documentation",
            'shortcuts': ['?'],
            'action': function() {
                dialogs.open(HelpDialog);
            }
        }
    ]).menuSection([
        {
            'id': "help.feedback",
            'title': "Submit feedback",
            'offline': false,
            'action': function() {
                window.open("https://github.com/FriendCode/codebox/issues");
            }
        }
    ]);
});

