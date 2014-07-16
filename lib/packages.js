var Q = require("q");
var path = require("path");
var Packager = require("pkgm");
var pkg = require("../package.json");

var manager = new Packager({
    'engine': "codebox",
    'version': pkg.version,
    'folder': path.resolve(__dirname, "../packages")
});

var init = function() {
    return Q()
    .then(function() {
        return manager.prepare(pkg.packageDependencies);
    });
};

module.exports = {
    init: init,
    manager: manager
};
