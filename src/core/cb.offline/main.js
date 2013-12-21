var _ = require('underscore');
var glob = require("glob");
var path = require('path');
var Q = require('q');
var Manifest = require('./manifest').Manifest;

function setup(options, imports, register) {
    var server = imports.server;
    var addons = imports.addons
    var logger = imports.logger.namespace("offline");

    var manifest = new Manifest();

    // Disable auth for the manifest file
    server.disableAuth("/manifest.appcache");

    // Gneerate manifest
    server.app.get("/manifest.appcache", function(req, res) {
        res.header("Content-Type", "text/cache-manifest");


        manifest.clear().then(function() {
            // Add network
            manifest.add("NETWORK", [
                '/rpc',
                '/vfs',
                '/export',
                '/socket.io',
                '/proxy'
            ]);

            // Add static files
            return manifest.addFolder(path.resolve(__dirname + '/../../client/build'), '/')
        }).then(function() {
            // Add static files
            return manifest.addFolder(path.resolve(__dirname + '/../../../docs'), '/docs/')
        }).then(function() {
            // Add addons
            return addons.list().then(function(addons) {
                return Q.all(_.map(addons, function(addon) {
                    // Add network resources
                    manifest.add("NETWORK", addon.network());

                    // Addon cached resources
                    return Q.all(_.map(addon.resources(), function(resource) {
                        return manifest.addFolder(addon.root, path.join("/static/addons/", addon.infos.name), resource);
                    }));
                }));
            });
        }).then(function() {
            return manifest.content();
        }).then(function(content) {
            res.send(content);
        }, function(err) {
            res.send(500, err.message);
        });
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
