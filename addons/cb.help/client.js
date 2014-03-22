define([
    "text!welcome.md"
], function(welcomeText) {
    var hr = codebox.require("hr/hr");
    var app = codebox.require("core/app");
    var menu = codebox.require("core/commands/menu");
    var files = codebox.require("core/files");
    var rpc = codebox.require("core/backends/rpc");
    var Command = codebox.require("models/command");

    // Help url
    var helpUrl = "http://help.codebox.io/";

    // Command to open changelog
    var commandChanges = Command.register("help.changes", {
        'category': "Help",
        'title': "Open Release Notes",
        'action': function(title) {
            return rpc.execute("box/changes").then(function(changes) {
                return files.openNew(title || "Release Notes", changes.content);
            });
        }
    });

    // Command to open welcome
    var commandWelcome = Command.register("help.welcome", {
        'category': "Help",
        'title': "Welcome",
        'action': function(title) {
            return files.openNew(title || "Welcome.md", welcomeText);
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
            'category': "Help",
            'title': "Documentation",
            'description': "Open Documentation",
            'shortcuts': ['?'],
            'offline': false,
            'action': function() {
                window.open(helpUrl);
            }
        }
    ]).menuSection([
        {
            'id': "help.feedback",
            'category': "Help",
            'title': "Submit Feedback",
            'offline': false,
            'action': function() {
                window.open("https://github.com/FriendCode/codebox/issues");
            }
        }
    ]);

    // Open changes if version changes
    app.once("ready", function() {
        //  Show release not if version increased
        //  If first time show welcome message

        var currentVersion = hr.configs.args.version;
        var lastVersion = hr.Storage.get("codeboxVersion");

        if (lastVersion == null) {
            commandWelcome.run();
        } else if (currentVersion != lastVersion) {
            commandChanges.run();
        }
        hr.Storage.set("codeboxVersion", currentVersion);
    });
});

