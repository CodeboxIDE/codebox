define([
    'hr/hr',
    'collections/addons'
], function (hr, Addons) {
    // Collection for all installed addons
    var addons = new Addons();

    return addons;
});