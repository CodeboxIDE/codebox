var Q = require("q");
var _ = require("lodash");
var path = require("path");
var Packager = require("pkgm");
var pkg = require("../package.json");

var events = require("./events");
var logger = require("./utils/logger")("packages");

var context;
var manager = new Packager({
    'engine': "codebox",
    'version': pkg.version,
    'folder': path.resolve(__dirname, "../packages"),
    'lessInclude': path.resolve(__dirname, "../editor/resources/stylesheets/variables.less")
});

manager.on("add", function(pkg) {
    events.emit("packages:add", pkg.infos());
});
manager.on("remove", function(pkg) {
    events.emit("packages:remove", pkg.infos());
});
manager.on("log", function(log) {
    logger[log.type].apply(logger, log.arguments);
});

var init = function() {
    context = {
        utils: _,
        promise: Q,
        hooks: require("./hooks"),
        events: require("./events"),
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

var install = function(url) {
    return manager.installByUri(url)
    .then(function(pkg) {
        return pkg.run(context)
        .thenResolve(pkg);
    });
};

var uninstall = function(name) {
    return manager.uninstall(name);
};

var list = function() {
    return manager.orderedPackages();
};

module.exports = {
    init: init,
    manager: manager,
    install: install,
    uninstall: uninstall,
    list: list
};
