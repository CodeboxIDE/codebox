var _ = require('lodash');
var Q = require('q');
var fs = require('fs');
var path = require('path');
var wrench = require('wrench');

var logger = require("../utils/logger")("local");

var LOCAL_SETTINGS_DIR = process.env.CODEBOX_LOCAL_FOLDER || path.join(process.env.HOME,'.codebox')
var SETTINGS_FILE = path.join(LOCAL_SETTINGS_DIR, 'settings.json');

// Base structure for a local workspace
// Store the workspace configuration in a file, ...
module.exports = function(options) {
    options = _.merge(options, {
        'hooks': {
            'settings.get': function(args) {
                return Q.nfcall(fs.readFile, SETTINGS_FILE, "utf-8")
                .then(JSON.parse)
                .fail(_.constant({}))
                .then(function(config) {
                    if (!config[options.id]) config[options.id] = {};
                    return config[options.id][args.user] || {};
                });
            },

            'settings.set': function(args) {
                return Q.nfcall(fs.readFile, SETTINGS_FILE, "utf-8")
                .then(JSON.parse)
                .fail(_.constant({}))
                .then(function(config) {
                    if (!config[options.id]) config[options.id] = {};
                    config[options.id][args.user] = args.settings;

                    return Q.nfcall(fs.writeFile, SETTINGS_FILE, JSON.stringify(config))
                    .thenResolve(config);
                })
                .then(function(config) {
                    return config[options.id][args.user] || {};
                });
            }
        },
        packages:{
            'root': path.resolve(LOCAL_SETTINGS_DIR, 'packages')
        }
    }, _.defaults);

    // Create .codebox folder
    logger.log("Creating", LOCAL_SETTINGS_DIR);
    wrench.mkdirSyncRecursive(LOCAL_SETTINGS_DIR, 0777);

    return options;
};
