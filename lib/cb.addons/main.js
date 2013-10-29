var _ = require('underscore');
var Q = require("q");
var fs  =  require('fs');
var path = require('path');
var express = require('express');
var Gittle = require('gittle');
var Gift = require('gift');
var temp = require('temp');
var wrench = require('wrench');

function setup(options, imports, register) {
    var logger = imports.logger.namespace("addons");
    var server = imports.server;

    // Map of addons infos
    var addons = {};

    // Addons path
    var addonsPath = __dirname + '/../../client/addons';

    // Load addons list
    var loadAddonsInfos = function() {
        addons = {};

        // Read addons directory
        return Q.nfcall(fs.readdir, addonsPath).then(function(dirs) {
            dirs.forEach(function (dir) {
                if (dir.indexOf('.') == 0) return;

                packageJsonFile = addonsPath + '/' + dir + '/package.json';
                if (!fs.existsSync(packageJsonFile)) return;
                addon = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));

                if (!addon.name || !addon.version || !addon.main) {
                    return;
                }

                logger.log("Load add-on", addon.name, addon.version);
                addons[dir] = addon;
            });

            return Q(addons);
        });
    };

    // Install an addon by its git url
    var installAddon = function(git, options) {
        var addon, tempDir;

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
            if (!addon.name || !addon.version || !addon.main) {
                throw new Error("Invalid 'package.json' file");
            }

            // Copy temp dir to addons dir
            var addonDir = path.join(addonsPath, addon.name);
            return Q.nfcall(wrench.copyDirRecursive, tempDir, addonDir, {forceDelete: true});
        }).then(function() {
            // Remove temporary dir
            return Q.nfcall(wrench.rmdirRecursive, tempDir, false);
        }).then(function() {
            // Reload addons
            if (!options.reload) {
                return Q(addons);
            }
            return loadAddonsInfos();
        }).then(function() {
            // Return addon infos
            return Q(addon);
        });
    };

    // Uninstall an addon
    var uninstallAddon = function(name) {
        var addonDir = path.join(addonsPath, name);
        logger.log("Uninstall add-on", name);
        return Q.nfcall(wrench.rmdirRecursive, addonDir, false).then(function() {
            return Q(true);
        });
    };


    // Init addons
    server.app.use('/static/addons', express.static(addonsPath));

    // Install defaults addons
    Q.all(_.map(options.defaults, function(git) {
        installAddon(git, {
            reload: false
        });
    })).then(function() {
        logger.log("load add-ons infos");
        return loadAddonsInfos();
    }).then(function() {
        console.log(arguments);
    }, function(err) {
        logger.exception(err);
    });

    register(null, {
        'addons': {
            'list': loadAddonsInfos,
            'install': installAddon,
            'uninstall': uninstallAddon
        }
    });
};

// Exports
module.exports = setup;
