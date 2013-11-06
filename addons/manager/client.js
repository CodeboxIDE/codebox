define(["views/dialog"], function(InstallerDialog) {
    var commands = require("core/commands");
    var app = require("core/app");
    var dialogs = require("utils/dialogs");

    // Add opening command
    commands.register("addons.installer", {
        title: "Add-ons",
        icon: "puzzle-piece"
    }, function() {
        dialogs.open(InstallerDialog);
    });
});

