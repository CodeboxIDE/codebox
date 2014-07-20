var _ = require('lodash');
var Q = require('q');
var fs = require('fs');
var path = require('path');
var wrench = require('wrench');

var logger = require("../utils/logger")("local");

var LOCAL_SETTINGS_DIR = path.join(
    process.env.HOME,
    '.codebox'
);

var SETTINGS_FILE = path.join(LOCAL_SETTINGS_DIR, 'settings.json')

// Base structure for a local workspace
// Store the workspace configuration in a file, ...
module.exports = function(options) {
    options = _.defaults(options, {
        'hooks': {
            'settings.get': function() {
                return Q.nfcall(fs.readFile, SETTINGS_FILE, "utf-8")
                .fail(_.constant("{}"))
                .then(JSON.parse)
                .then(function(config) {
                    return config[options.id] || {};
                });
            },
            'settings.set': function(data) {
                return Q.nfcall(fs.readFile, SETTINGS_FILE, "utf-8")
                .fail(_.constant("{}"))
                .then(JSON.parse)
                .then(function(config) {
                    config[options.id] = data;

                    return Q.nfcall(fs.writeFile, SETTINGS_FILE, JSON.stringify(config))
                    .thenResolve(config);
                })
                .then(function(config) {
                    return config[options.id] || {};
                });
            }
        }
    });

    // Create .codebox folder
    logger.log("Creating", LOCAL_SETTINGS_DIR);
    wrench.mkdirSyncRecursive(LOCAL_SETTINGS_DIR);

    return options;
};
