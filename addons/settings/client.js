define(["views/dialog"], function(SettingsDialog) {
    var commands = require("core/commands");
    var app = require("core/app");
    var dialogs = require("utils/dialogs");

    // Add opening command
    commands.register("addons.settings.open", {
        title: "Settings",
        icon: "cog"
    }, function() {
        dialogs.open(SettingsDialog);
    });
});

