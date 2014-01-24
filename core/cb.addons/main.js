var _ = require('underscore');
var Q = require("q");
var fs  =  require('fs');
var path = require('path');
var express = require('express');
var Gittle = require('gittle');
var wrench = require('wrench');
var exec = require('child_process').exec;

var Addon = require("./addon");

// GZIP static middleware
var gzipStatic = require('connect-gzip-static');


function setup(options, imports, register, app) {
    var logger = imports.logger.namespace("addons", false);
    var server = imports.server;
    var events = imports.events;
    var hooks = imports.hooks;

    // Directory with all the defaults addons
    var configDefaultsPath = path.resolve(options.defaultsPath);

    // Directory with all the box addons
    var configAddonsPath = path.resolve(options.path);

    // Directory for temporary storage
    var configTempPath = options.tempPath ? path.resolve(options.tempPath) : null;

    // Build the directory for stroign addons
    if (!fs.existsSync(configAddonsPath)) {
        wrench.mkdirSyncRecursive(configAddonsPath);
    }

    // Check if an addons is a default addons
    var isDefaultAddon = function(addon) {
        if (!_.isString(addon)) addon = addon.infos.name;
        return fs.existsSync(path.join(configDefaultsPath, addon));
    };

    // Load addons list from a directory return as a map name -> addon
    var loadAddonsInfos = function(addonsRoot, _options) {
        // Diretcory to explore
        addonsRoot = addonsRoot || configAddonsPath;

        // Options
        _options = _.defaults({}, _options || {}, {
            ignoreError: false
        });

        return Q.nfcall(fs.readdir, addonsRoot).then(function(dirs) {
            return _.reduce(dirs, function(previous, dir) {
                return previous.then(function(addons) {
                    if (dir.indexOf('.') == 0) return Q(addons);

                    var addonPath = path.join(addonsRoot, dir);
                    var addon = new Addon(logger, addonPath, options);
                    return addon.load().then(function() {
                        addon.infos.default = isDefaultAddon(addon);
                        addons[addon.infos.name] = addon;
                        return Q(addons);
                    }, function(err) {
                        logger.error("error", err);
                        if (_options.ignoreError) {
                            //  When ignoring error
                            //  it will check that the addon is not a symlink
                            //  and unlink invalid ones
                            logger.error("ignore invalid addon", addonPath);
                            return addon.isSymlink().then(function(symlink) {
                                if (symlink) {
                                    logger.error("unlink invalid addon:", addon.root);
                                    return addon.unlink();
                                }
                            }).then(function() {
                                return Q(addons);
                            }, function() {
                                return Q(addons);
                            });
                        }
                        return Q.reject(err);
                    });
                });
            }, Q({}));
        });
    };

    // Run an operation for a collection fo addons
    var runAddonsOperation = function(operation, options) {
        options = _.defaults(options || {}, {
            failOnError: true
        });

        var failedAddons = [];

        return function(addons) {
            return Q.all(_.map(addons, function(addon) {
                return operation(addon).then(function() {
                    return addon;
                }, function(err) {
                    if (options.failOnError) {
                        return Q.reject(err);
                    } else {
                        logger.error("ignore error", err);
                        failedAddons.push(addon.infos.name);
                        return Q();
                    }
                });
            })).then(function() {
                return Q(_.omit(addons, failedAddons));
            });
        };
    };

    // Copy defaults addons
    var copyDefaultsAddons = function() {
        var first = loadAddonsInfos(configDefaultsPath);

        if (options.dev) {
            logger.log("Optmize defaults addons for production");
            first = first.then(runAddonsOperation(function(addon) {
                return addon.optimizeClient(true);
            }));
        }

        return first.then(runAddonsOperation(function(addon) {
            logger.log("Adding default addon", addon.infos.name);

            // Path to addon
            var addonPath = path.resolve(configAddonsPath, addon.infos.name);

            return Q.nfcall(fs.lstat, addonPath)
            .then(function(stats) {
                if (!stats.isSymbolicLink()) {
                    logger.error("Remove and replace ", addonPath);
                    return wrench.rmdirRecursive(addonPath);
                }

                // Unlink only if exists
                return Q.nfcall(fs.unlink, addonPath);
            }, function(err) {
                if (err.code != 'ENOENT') {
                    return Q.reject(err);
                }
            })
            .then(function() {
                // Blacklist
                if (addon.isBlacklisted()) {
                    logger.error("Default addon", addon.infos.name, "is blacklisted");
                    return Q();
                }

                // Relink it
                //logger.log("link ", addon.root, configAddonsPath)
                return addon.symlink(configAddonsPath);
            });
        }));
    };

    // Install an addon by its git url
    var installAddon = function(git, _options) {
        var addon, tempDir;

        _options = _.defaults({}, _options || {}, {

        });

        var gitRef = "master";
        var gitParts = git.split("#");
        if (gitParts.length == 2) {
            git = gitParts[0];
            gitRef = gitParts[1];
        }

        logger.log("Install add-on", git, "ref="+gitRef);

        tempDir = path.join(configTempPath, "t"+Date.now());

        // Create temporary dir
        return Q.nfcall(fs.mkdir, tempDir).then(function() {
            // Clone git repo
            return Gittle.clone(git, tempDir);
        }).then(function(repo) {
            // Checkout the addon ref
            return repo.checkout(gitRef);
        }).then(function() {
            // Load addon
            addon = new Addon(logger, tempDir, options);
            return addon.load();
        }).then(function() {
            // Blacklist
            if (addon.isBlacklisted()) {
                return Q.reject(new Error("Addon "+addon.infos.name+"is blacklisted"));
            }

            // Valid installation of addon with a hook
            return hooks.use("addons", addon.infos);
        }).then(function() {
            // Copy to addons dir
            return addon.transfer(configAddonsPath);
        }).then(function(newAddon) {
            addon = newAddon;

            // Remove temporary dir
            return Q.nfcall(wrench.rmdirRecursive, tempDir, false);
        }).then(function() {
            // Install node dependencies
            return addon.installDependencies();
        }).then(function() {
            // If client side addon then optimize it
            return addon.optimizeClient();
        }).then(function() {
            return addon.start(app);
        }).then(function() {
            // Emit events
            events.emit('addons.install', addon.infos);

            // Return addon infos
            return Q(addon);
        });
    };

    // Uninstall an addon
    var uninstallAddon = function(name) {
        var addonDir = path.join(configAddonsPath, name);
        logger.log("Uninstall add-on", name);
        if (isDefaultAddon(name)) {
            return Q.reject(new Error("Cannot uninstall a default addon"));
        }
        return Q.nfcall(wrench.rmdirRecursive, addonDir, false).then(function() {
            // Emit events
            events.emit('addons.uninstall', {
                'name': name
            });

            return Q(true);
        });
    };

    // Init addons
    server.disableAuth("/static/addons");
    server.app.use('/static/addons', gzipStatic(configAddonsPath));

    // Prepare defaults addons
    return copyDefaultsAddons().then(function() {
        // Load collection of addons
        return loadAddonsInfos(null, {
            ignoreError: true
        });
    }).then(runAddonsOperation(function(addon) {
        // Install node dependencies
        return addon.installDependencies();
    }, {
        failOnError: false
    })).then(runAddonsOperation(function(addon) {
        // Optimized addons
        return addon.optimizeClient(options.dev);
    }, {
        failOnError: false
    })).then(runAddonsOperation(function(addon) {
        // Start addons
        return addon.start(app);
    }, {
        failOnError: false
    })).then(function() {
        logger.log("Addons are ready");
        return {
            'addons': {
                'list': loadAddonsInfos,
                'install': installAddon,
                'uninstall': uninstallAddon
            }
        };
    });
};

// Exports
module.exports = setup;
