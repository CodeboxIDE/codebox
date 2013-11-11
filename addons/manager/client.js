define(["views/dialog"], function(InstallerDialog) {
    var commands = codebox.require("core/commands");
    var app = codebox.require("core/app");
    var dialogs = codebox.require("utils/dialogs");
    var settings = codebox.require("utils/settings");

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

