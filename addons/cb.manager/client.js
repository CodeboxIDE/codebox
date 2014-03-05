define([
    "settings",
    "views/dialog"
], function(managerSettings, InstallerDialog) {
    var commands = codebox.require("core/commands/toolbar");
    var app = codebox.require("core/app");
    var dialogs = codebox.require("utils/dialogs");
    var menu = codebox.require("core/commands/menu");

    // Add opening command
    var command = commands.register("addons.manager.open", {
        title: "Add-ons",
        icons: {
            'default': "puzzle-piece",
        },
        visible: false,
        offline: false,
    }, function() {
        dialogs.open(InstallerDialog);
    });

    // Add the command to file/tools menu
    menu.getById("file").menu.add(command);
});

