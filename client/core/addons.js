define([
    'hr/hr',
    'hr/promise',
    'models/command',
    'collections/commands',
    'collections/addons',
    'utils/dialogs',
    'core/operations'
], function (hr, Q, Command, Commands, Addons, dialogs, operations) {
    // Collection for all installed addons
    var addons = new Addons();

    // Command to install with an url
    Command.register("addons.install", {
        category: "Add-ons",
        title: "Install",
        description: "Install with GIT Url",
        offline: false,
        action: function(url) {
            return Q()
            .then(function() {
                if (url) return url;
                return dialogs.prompt("Install a new addon", "GIT url for the addon:", "");
            })
            .then(function(_url) {
                return operations.start("addon.install", function(op) {
                    return addons.install(_url);
                }, {
                    title: "Installing add-on"
                });
            })
        }
    });

    // Command to uninstall from a name
    Command.register("addons.uninstall", {
        category: "Add-ons",
        title: "Uninstall",
        description: "Uninstall with name",
        offline: false,
        search: false,
        action: function(name) {
            return Q()
            .then(function() {
                if (name) return name;
                return dialogs.prompt("Uninstall an addon", "Name of the addon:", "");
            })
            .then(function(_name) {
                return operations.start("addon.uninstall", function(op) {
                    return addons.uninstall(_name);
                }, {
                    title: "Uninstalling add-on"
                });
            })
        }
    });

    return addons;
});