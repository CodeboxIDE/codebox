define([
    'hr/promise',
    'hr/utils',
    'hr/hr',
    'models/command',
    'collections/addons',
    'core/box',
    'core/addons',
    'core/search',
    'core/settings',
    'utils/string'
], function(Q, _, hr, Command, Addons, box, addons, search, settings, string) {

    var addonsSettings = settings.add({
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

    // Filter a collection fo addons by a query to search for
    var filterAddonsByQuery = function(_addons, query) {
        return _addons.filter(function(addon) {
            var text = [
                addon.get("name"),
                addon.get("description")
            ].join(" ");
            return (string.score("Add-ons", query) > 0
            || string.score(text, query) > 0);
        });
    };

    // Transform an addon to a basic command
    var addonToCommand = function(preText, addon, callback) {
        return {
            'category': "Add-ons",
            'title': preText+" "+addon.get("name"),
            'label': addon.get("version")+ " - "+addon.get("author.name"),
            'icons': {
                'search': "puzzle-piece"
            },
            'offline': false,
            'action': callback
        };
    };

    // Transform an addon to an install command
    var addonToInstallCommand = function(addon) {
        var preText = "Install";
        if (addons.isInstalled(addon)) {
            if (!addons.isUpdated(addon)) {
                preText = "Update";
            } else {
                return null;
            }
        }
        return addonToCommand(preText, addon, function() {
            return Command.run("addons.install", addon.get("git"));
        });
    };

    // Transform an addon to an uninstall command
    var addonToUninstallCommand = function(addon) {
        if (addons.isDefault(addon)) return null;
        return addonToCommand("Uninstall", addon, function() {
            return Command.run("addons.uninstall", addon.get("name"));
        });
    };

    // Search for add-ons to uninstall
    search.handler({
        'id': "addons:uninstall",
        'title': "Uninstall Add-ons"
    }, function(query) {
        if (!query) return [];

        return _.chain(
            filterAddonsByQuery(addons, query)
        )
        .map(addonToUninstallCommand)
        .compact()
        .value();
    });

    // Search for add-ons to install/update
    search.handler({
        'id': "addons:install",
        'title': "Install Add-ons"
    }, function(query) {
        if (!query) return [];

        var addonsIndex = new Addons();
        
        return addonsIndex.loadFromIndex(addonsSettings.user.get("registry"))
        .then(function() {
            return _.chain(
                filterAddonsByQuery(addonsIndex, query)
            )
            .map(addonToInstallCommand)
            .compact()
            .value();
        });
    });
});