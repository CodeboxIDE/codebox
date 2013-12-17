define(["views/dialog"], function(SettingsDialog) {
    var commands = codebox.require("core/commands");
    var app = codebox.require("core/app");
    var dialogs = codebox.require("utils/dialogs");
    var menu = codebox.require("core/menu");

    // Add opening command
    var command = commands.register("settings", {
        title: "Settings",
        icon: "cog",
        shortcuts: [
            "mod+,"
        ],
        visible: false,
        position: 100
    }, function(page) {
        dialogs.open(SettingsDialog, {
            "page": page
        });
    });

    menu.getById("file").menu.add(command);
});

