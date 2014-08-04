define([
    "collections/packages",
    "core/events",
    "utils/dialogs"
], function(Packages, events, dialogs) {
    var packages = new Packages();

    events.on("e:packages:add", function(pkg) {
        pkg = packages.add(pkg);
        pkg.load()
        .fail(dialogs.error);
    });

    events.on("e:packages:remove", function(pkg) {
        pkg = packages.get(pkg.name);
        if (pkg) pkg.destroy();
    });

    return packages;
});