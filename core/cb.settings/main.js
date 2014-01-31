// Requires
var Q = require('q');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

function setup(options, imports, register) {
    var workspace = imports.workspace;
    var logger = imports.logger.namespace("settings");

    var settings = {};
    

    // Return settings
    var getSettings = function(key, def) {
        return settings[workspace.id][key] || def;
    };

    // Set settings
    var setSettings = function(key, value) {
        settings[workspace.id][key] = value
    };

    // Save settings
    var saveSettings = function() {
        logger.log("Saving local settings")
        return Q().then(function() {
            return Q.nfcall(fs.writeFile, options.storageFile, JSON.stringify(settings, undefined, 4));
        });
    };

    // Extend settings
    var extendSettings = function(key, value) {
        var s = getSettings(key, {});
        s = _.extend(s, value);
        setSettings(key, s);
    };

    return Q.nfcall(fs.readFile, options.storageFile, "utf-8").then(function(content) {
        settings = JSON.parse(content);
    }).fail(function() {
        settings = {};
        return Q();
    }).then(function() {
        logger.log("Settings load for", workspace.id);
        settings[workspace.id] = settings[workspace.id] || {};
        return {
            "settings": {
                'get': getSettings,
                'set': setSettings,
                'extend': extendSettings,
                'save': saveSettings
            }
        };
    });
}

// Exports
module.exports = setup;
