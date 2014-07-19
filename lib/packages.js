var Q = require("q");
var _ = require("lodash");
var path = require("path");
var Packager = require("pkgm");
var pkg = require("../package.json");

var logger = require("./utils/logger")("packages");

var manager = new Packager({
    'engine': "codebox",
    'version': pkg.version,
    'folder': path.resolve(__dirname, "../packages"),
    'lessInclude': path.resolve(__dirname, "../editor/resources/stylesheets/variables.less")
});

var init = function() {
    var context = {
        workspace: require("./workspace"),
        rpc: require("./rpc"),
        socket: require("./socket"),
        logger: require("./utils/logger")("package")
    };


    logger.log("Load and prepare packages ("+_.size(pkg.packageDependencies)+" dependencies)");
    return Q()
    .then(function() {
        return manager.prepare(pkg.packageDependencies);
    })
    .then(function() {
        return manager.runAll(context);
    });
};

module.exports = {
    init: init,
    manager: manager
};
