var _ = require("underscore");
var Q = require("q");
var fs  =  require('fs');
var express = require('express');

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
        fs.readdir(addonsPath, function (err, dirs) {
            if (err) {
                throw err;
            }
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
        });
    };


    // Init addons
    server.app.use('/static/addons', express.static(addonsPath));

    loadAddonsInfos();

    register(null, {
        'addons': {
            'info': addons
        }
    });
};

// Exports
module.exports = setup;
