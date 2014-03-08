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
            .then(function(url) {
                return operations.start("addon.install", function(op) {
                    return addons.install(url);
                }, {
                    title: "Installing add-on"
                });
            })
        }
    });

    return addons;
});