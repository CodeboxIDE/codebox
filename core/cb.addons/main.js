var _ = require('lodash');
var Q = require("q");
var fs  =  require('fs');
var path = require('path');
var express = require('express');
var Gittle = require('gittle');
var wrench = require('wrench');
var exec = require('child_process').exec;

var Addon = require("./addon");
var manager = require("./manager");
var registry = require("./registry");


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

    // Options for addons
    var addonsOptions = {
        'blacklist': options.blacklist,
        'logger': logger
    };

    // Build the directory for stroign addons
    if (!fs.existsSync(configAddonsPath)) {
        wrench.mkdirSyncRecursive(configAddonsPath);
    }

    // Check if an addons is a default addons
    var isDefaultAddon = function(addon) {
        if (!_.isString(addon)) addon = addon.infos.name;
        return fs.existsSync(path.join(configDefaultsPath, addon));
    };

    // Loader
    var loadAddonsInfos = function(addonsRoot, _options) {
        return manager.loadAddonsInfos(addonsOptions, addonsRoot || configAddonsPath, _options)
        .then(function(addons) {
            return _.chain(addons)
            .map(function(addon, name) {
                addon.infos.default = isDefaultAddon(addon);
                return [
                    name, addon
                ];
            })
            .object()
            .value()
        });
    };

    // Copy defaults addons
    var copyDefaultsAddons = function() {
        var first = loadAddonsInfos(configDefaultsPath);

        return first.then(manager.runAddonsOperation(function(addon) {
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
        })
        .then(function(repo) {
            // Checkout the addon ref
            return repo.checkout(gitRef);
        })
        .then(function() {
            // Load addon
            addon = new Addon(tempDir, addonsOptions);
            return addon.load();
        })
        .then(function() {
            // Blacklist
            if (addon.isBlacklisted()) {
                return Q.reject(new Error("Addon "+addon.infos.name+"is blacklisted"));
            }

            // Valid installation of addon with a hook
            return hooks.use("addons", addon.infos);
        })
        .then(function() {
            // Copy to addons dir
            return addon.transfer(configAddonsPath);
        })
        .then(function(newAddon) {
            addon = newAddon;
        })
        .fin(function() {
            // Remove temporary dir
            return Q.nfcall(wrench.rmdirRecursive, tempDir, false);
        })
        .then(function() {
            // Install node dependencies
            return addon.installDependencies();
        })
        .then(function() {
            // If client side addon then optimize it
            return addon.optimizeClient();
        })
        .then(function() {
            return addon.start(app);
        })
        .then(function() {
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
    return copyDefaultsAddons()
    .then(function() {
        // Load collection of addons
        return loadAddonsInfos(configAddonsPath, {
            unlinkInvalid: true
        });
    })
    .then(manager.runAddonsOperation(function(addon) {
        if (!addon.hasDependencies() || addon.areDependenciesInstalled()) return;

        // Install dependencies
        return addon.installDependencies();
    }, {
        failOnError: false
    }))
    .then(manager.runAddonsOperation(function(addon) {
        // Build non optimized addons
        return addon.optimizeClient();
    }, {
        failOnError: false
    }))
    .then(manager.runAddonsOperation(function(addon) {
        // Start addons
        return addon.start(app);
    }, {
        failOnError: false
    }))
    .then(function() {
        logger.log("Addons are ready");
        return {
            'addons': {
                'registry': registry.get,
                'list': _.partial(loadAddonsInfos, configAddonsPath),
                'install': installAddon,
                'uninstall': uninstallAddon
            }
        };
    });
};

// Exports
module.exports = setup;
