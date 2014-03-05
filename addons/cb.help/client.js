define([], function() {
    var hr = codebox.require("hr/hr");
    var app = codebox.require("core/app");
    var menu = codebox.require("core/commands/menu");
    var files = codebox.require("core/files");
    var rpc = codebox.require("core/backends/rpc");
    var Command = codebox.require("models/command");

    // Help url
    var helpUrl = "http://help.codebox.io/";

    // Command open changelog
    var commandChanges = Command.register({
        'id': "help.changes",
        'title': "Open Release Notes",
        'action': function(title) {
            return rpc.execute("box/changes").then(function(changes) {
                return files.openNew(title || "Release Notes", changes.content);
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
            'offline': false,
            'action': function() {
                window.open(helpUrl);
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

    // Open changes if version changes
    app.once("ready", function() {
        var currentVersion = hr.configs.args.version;
        var lastVersion = hr.Storage.get("codeboxVersion");

        if (currentVersion != lastVersion) {
            commandChanges.run();
        }
        hr.Storage.set("codeboxVersion", currentVersion);
    });
});

