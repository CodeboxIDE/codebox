define(["views/dialog"], function(SettingsDialog) {
    var commands = codebox.require("core/commands");
    var app = codebox.require("core/app");
    var dialogs = codebox.require("utils/dialogs");
    var menu = codebox.require("core/menu");

    // Add opening command
    var command = commands.register("settings.open", {
        title: "Settings",
        icon: "cog",
        shortcuts: [
            "mod+,"
        ],
        visible: false,
        position: 1000
    }, function() {
        dialogs.open(SettingsDialog);
    });

    menu.getById("file").menu.add(command);
});

