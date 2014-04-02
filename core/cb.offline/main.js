var _ = require('lodash');
var glob = require("glob");
var path = require('path');
var Q = require('q');
var Manifest = require('./manifest').Manifest;
var pkg = require('../../package.json');
var crc = require('crc');

function setup(options, imports, register) {
    var server = imports.server;
    var addons = imports.addons
    var logger = imports.logger.namespace("offline");

    var manifest = new Manifest();
    var startTime = Date.now();

    // Disable auth for the manifest file
    server.disableAuth("/manifest.appcache");

    // Generate manifest
    server.app.get("/manifest.appcache", function(req, res, next) {
        res.header("Content-Type", "text/cache-manifest");

        addons.list()
        .then(function(installedAddons) {
            var revision = pkg.version+"-"+crc.hex32(crc.crc32(_.map(installedAddons, function(addon, addonName) {
                return addonName+":"+addon.infos.version;
            }).sort().join("-")));

            if (options.dev) revision = revision+"-"+startTime;
            
            // Clear manifest
            return manifest.clear(revision);
        })
        .then(function() {
            // Add network
            manifest.add("NETWORK", [
                '*'
            ]);

            // Add static files
            return manifest.addFolder(path.resolve(__dirname + '/../../client/build'), './', null, [
                "index.html"
            ]);
        })
        .then(function() {
            // Add addons
            return addons.list().then(function(addons) {
                return Q.all(_.map(addons, function(addon) {
                    // Add network resources
                    manifest.add("NETWORK", addon.network());

                    // Addon cached resources
                    return Q.all(_.map(addon.resources(), function(resource) {
                        return manifest.addFolder(addon.root, path.join("static/addons/", addon.infos.name), resource);
                    }));
                }));
            });
        }).then(function() {
            return manifest.content();
        }).then(function(content) {
            res.send(content);
        }, next);
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
