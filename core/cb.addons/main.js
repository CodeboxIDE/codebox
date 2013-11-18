var _ = require('underscore');
var Q = require("q");
var fs  =  require('fs');
var path = require('path');
var express = require('express');
var Gittle = require('gittle');
var Gift = require('gift');
var wrench = require('wrench');
var requirejs = require('requirejs');
var exec = require('child_process').exec;

var Addon = require("./addon");

function setup(options, imports, register, app) {
    var logger = imports.logger.namespace("addons", true);
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
    var loadAddonsInfos = function(addonsRoot) {
        addonsRoot = addonsRoot || configAddonsPath;
        return Q.nfcall(fs.readdir, addonsRoot).then(function(dirs) {
            return _.reduce(dirs, function(previous, dir) {
                return previous.then(function(addons) {
                    if (dir.indexOf('.') == 0) return Q(addons);

                    var addonPath = path.join(addonsRoot, dir);
                    var addon = new Addon(logger, addonPath);
                    return addon.load().then(function() {
                        addon.infos.default = isDefaultAddon(addon);
                        addons[addon.infos.name] = addon;
                        return Q(addons);
                    });
                });
            }, Q({}));
        });
    };

    // Run an operation for a collection fo addons
    var runAddonsOperation = function(operation) {
        return function(addons) {
            return Q.all(_.map(addons, operation)).then(function() {
                return Q(addons);
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
            return Q.nfcall(fs.unlink, path.resolve(configAddonsPath, addon.infos.name)).then(function() {
                return addon.symlink(configAddonsPath);
            });
        }));
    };

    // Install an addon by its git url
    var installAddon = function(git, options) {
        var addon, tempDir;

        options = _.defaults({}, options || {}, {
            
        });

        logger.log("Install add-on", git);

        tempDir = path.join(configTempPath, "t"+Date.now());

        // Create temporary dir
        return Q.nfcall(fs.mkdir, tempDir).then(function() {
            // Clone git repo
            return Q.nfcall(Gift.clone, git, tempDir);
        }).then(function(repo) {
            // Load addon
            addon = new Addon(logger, tempDir);
            return addon.load();
        }).then(function() {
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
    server.app.use('/static/addons', express.static(configAddonsPath));

    // Prepare defaults addons
    copyDefaultsAddons().then(function() {
        // Load collection of addons
        return loadAddonsInfos();
    }).then(runAddonsOperation(function(addon) {
        // Install node dependencies
        return addon.installDependencies();
    })).then(runAddonsOperation(function(addon) {
        // Optimized addons
        return addon.optimizeClient(options.dev);
    })).then(runAddonsOperation(function(addon) {
        // Start addons
        return addon.start(app);
    })).then(function() {
        logger.log("Addons are ready");
        register(null, {
            'addons': {
                'list': loadAddonsInfos,
                'install': installAddon,
                'uninstall': uninstallAddon
            }
        });
    }, function(err) {
        logger.exception(err);
    });
};

// Exports
module.exports = setup;
