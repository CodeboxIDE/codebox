var _ = require('underscore');
var Q = require("q");
var fs  =  require('fs');
var path = require('path');
var express = require('express');
var Gittle = require('gittle');
var Gift = require('gift');
var temp = require('temp');
var wrench = require('wrench');
var exec = require('child_process').exec;

function setup(options, imports, register, app) {
    var logger = imports.logger.namespace("addons");
    var server = imports.server;
    var events = imports.events;

    if (!options.path) {
        throw new Error("Error addons need a base path");
    }

    // Path to install addons
    var addonsPath = path.resolve(options.path);
    if (!fs.existsSync(addonsPath)) {
        fs.mkdirSync(addonsPath);
    }

    // Path for core addons
    var defaultsPath = path.resolve(options.defaultsPath);

    // Valid a package.json info
    var validPackage = function(addon) {
        return !(!addon.name || !addon.version
            || (!addon.main && !addon.client && !addon.client.main));
    }

    // Load addons list
    var loadAddonsInfos = function() {
        return Q.nfcall(fs.readdir, addonsPath).then(function(dirs) {
            var addons = {};

            dirs.forEach(function (dir) {
                if (dir.indexOf('.') == 0) return;

                packageJsonFile = addonsPath + '/' + dir + '/package.json';
                if (!fs.existsSync(packageJsonFile)) return;
                addon = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));

                if (!validPackage(addon)) {
                    return;
                }

                logger.log("Load add-on", addon.name, addon.version);
                addons[dir] = addon;
            });

            return Q(addons);
        }); 
    };

    // Initialize node addons
    var initNodeAddons = function() {
        logger.log("Load node addons");
        return loadAddonsInfos().then(function(addons) {
            console.log("Addons list", addons);
            return Q.all(_.map(addons, function(addon) {
                if (!addon.main) return;
                var addonPath = path.resolve(addonsPath + '/' + addon.name + '/');
                logger.log("addon", addon.name, "is a node addon:", addonPath);
                return app.load([
                    {
                        packagePath: addonPath
                    }
                ]);
            }));
        });  
    };

    // Install an addon by its git url
    var installAddon = function(git, options) {
        var addon, tempDir, addonDir;

        options = _.defaults({}, options || {}, {
            reload: true
        });

        logger.log("Install add-on", git);

        // Create temporary dir
        return Q.nfcall(temp.mkdir, 'addon').then(function(dirPath) {
            // Clone git repo
            tempDir = dirPath;
            return Q.nfcall(Gift.clone, git, tempDir);
        }).then(function(repo) {
            // Check addon
            var packageJsonFile = path.join(tempDir, "package.json");
            if (!fs.existsSync(packageJsonFile)) {
                throw new Error("No 'package.json' in this repository");
            }
            addon = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));
            if (!validPackage(addon)) {
                throw new Error("Invalid 'package.json' file");
            }

            // Copy temp dir to addons dir
            addonDir = path.join(addonsPath, addon.name);
            return Q.nfcall(wrench.copyDirRecursive, tempDir, addonDir, {forceDelete: true});
        }).then(function() {
            // Remove temporary dir
            return Q.nfcall(wrench.rmdirRecursive, tempDir, false);
        }).then(function() {
            // Install dependencies
            logger.log("Install dependencies ", addonDir);
            return Q.nfcall(exec, "cd "+addonDir+" && npm install .");
        }).then(function(stdout, stderr) {
            // Reload addons
            if (!options.reload) {
                return Q({});
            }
            return loadAddonsInfos();
        }).then(function() {
            // Emit events
            events.emit('addons.install', addon);

            // Return addon infos
            return Q(addon);
        });
    };

    // Install defaults addons
    var installDefaultsAddons = function() {
        return Q.nfcall(wrench.copyDirRecursive, defaultsPath, addonsPath, {forceDelete: true});
    }

    // Uninstall an addon
    var uninstallAddon = function(name) {
        var addonDir = path.join(addonsPath, name);
        logger.log("Uninstall add-on", name);
        return Q.nfcall(wrench.rmdirRecursive, addonDir, false).then(function() {
            // Emit events
            events.emit('addons.uninstall', {
                'name': name
            });

            return Q(true);
        });
    };

    // Init addons
    server.app.use('/static/addons', express.static(addonsPath));

    // Install defaults addons if addons diretcory is empty
    logger.log("init addons");
    installDefaultsAddons().then(function() {
        return initNodeAddons();
    }).fail(function(err) {
        logger.error("Error with init of addons:");
        logger.exception(err, false);
    }).fin(function() {
        register(null, {
            'addons': {
                'list': loadAddonsInfos,
                'install': installAddon,
                'uninstall': uninstallAddon
            }
        });
    });
};

// Exports
module.exports = setup;
