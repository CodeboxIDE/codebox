define([
    'hr/hr',
    'collections/addons'
], function (hr, Addons) {
    // Collection for all installed addons
    var addons = new Addons();

    // Load new addons
    addons.on("add", function(addon) {
        addon.load();
    });

    return addons;
});