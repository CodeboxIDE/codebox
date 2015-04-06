var Packages = require("../collections/packages");
var dialogs = require("../utils/dialogs");
var events = require("./events");

var packages = new Packages();

// Load new installed packages
events.on("e:packages:add", function(pkg) {
    pkg = packages.add(pkg);
    pkg.load()
    .fail(dialogs.error);
});

// Unload removed packages
events.on("e:packages:remove", function(pkg) {
    pkg = packages.get(pkg.name);
    if (pkg) pkg.destroy();
});

module.exports = packages;
