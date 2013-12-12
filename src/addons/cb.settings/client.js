define(["views/dialog"], function(SettingsDialog) {
    var commands = codebox.require("core/commands");
    var app = codebox.require("core/app");
    var dialogs = codebox.require("utils/dialogs");

    // Add opening command
    commands.register("settings.open", {
        title: "Settings",
        icon: "cog",
        shortcuts: [
            "mod+,"
        ],
        visible: false
    }, function() {
        dialogs.open(SettingsDialog);
    });
});

