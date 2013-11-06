define(["views/dialog"], function(InstallerDialog) {
    var commands = require("core/commands");
    var app = require("core/app");
    var dialogs = require("utils/dialogs");
    var settings = require("utils/settings");

    // Add settings
    settings.add({
        'namespace': "manager",
        'title': "Addons",
        'defaults': {
            'registry': "https://api.codebox.io"
        },
        'fields': {
            'registry': {
                'label': "Registry",
                'type': "text"
            }
        }
    });

    // Add opening command
    commands.register("addons.installer", {
        title: "Add-ons",
        icon: "puzzle-piece"
    }, function() {
        dialogs.open(InstallerDialog);
    });
});

