define(["views/dialog"], function(SettingsDialog) {
    var commands = codebox.require("core/commands/toolbar");
    var app = codebox.require("core/app");
    var dialogs = codebox.require("utils/dialogs");
    var menu = codebox.require("core/commands/menu");

    // Add opening command
    var command = commands.register("settings", {
        title: "Settings",
        icon: "cog",
        shortcuts: [
            "mod+,"
        ],
        visible: false,
        position: 100,
        offline: false
    }, function(page) {
        dialogs.open(SettingsDialog, {
            'page': page,
            'keyboardEnter': false
        });
    });

    menu.getById("file").menu.add(command);
});

