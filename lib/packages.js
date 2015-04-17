var Q = require("q");
var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var wrench = require("wrench");
var Packager = require("pkgm");
var pkg = require("../package.json");

var events = require("./events");
var logger = require("./utils/logger")("packages");

var context, manager;

// Remove output if folder or symlink
function cleanFolder(outPath) {
    try {
        var stat = fs.lstatSync(outPath);
        if (stat.isDirectory()) {
            wrench.rmdirSyncRecursive(outPath);
        } else  {
            fs.unlinkSync(outPath);
        }
    } catch (e) {
        if (e.code != "ENOENT") throw e;
    }
}


var init = function(config) {
    manager = manager = new Packager({
        'engine': "codebox",
        'version': pkg.version,
        'folder': config.packages.root,
        'lessInclude': path.resolve(__dirname, "../editor/resources/stylesheets/variables.less")
    });

    manager.on("add", function(pkg) {
        logger.log("add package", pkg.pkg.name);
        events.emit("packages:add", pkg.infos());
    });
    manager.on("remove", function(pkg) {
        logger.log("remove package", pkg.pkg.name);
        events.emit("packages:remove", pkg.infos());
    });
    manager.on("log", function(log) {
        logger[log.type].apply(logger, log.arguments);
    });

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

    // Keep package foler clean (only packages, ...)
    .then(function() {
        var packages = fs.readdirSync(config.packages.root);

        return _.each(packages, function(iPkg) {
            var pkgPath = path.resolve(config.packages.root, iPkg);

            if (!fs.existsSync(path.resolve(pkgPath, "package.json"))) {
                logger.warn("remove non-package", pkgPath);
                cleanFolder(pkgPath);
            }
        });
    })

    .then(function() {
        var defaultPackagesRoot = path.resolve(__dirname, "../packages");
        if (defaultPackagesRoot == config.packages.root) return;

        // Copy default packages to the packages folder
        var defaultPackages = fs.readdirSync(defaultPackagesRoot);

        // Create packages folder
        wrench.mkdirSyncRecursive(config.packages.root);

        return _.each(defaultPackages, function(defaultPkg) {
            var pkgPath = path.resolve(defaultPackagesRoot, defaultPkg);
            var outPath = path.resolve(config.packages.root, defaultPkg);

            // Remove output if folder or symlink
            cleanFolder(outPath);

            // Create a new symlink
            logger.log("symlink default package", defaultPkg);
            fs.symlinkSync(
                pkgPath,
                outPath
            );
        });
    })
    .then(function() {
        return manager.prepare(_.extend(pkg.packageDependencies, config.packages.install || {}));
    })
    .then(function() {
        if (!config.run) return;
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
