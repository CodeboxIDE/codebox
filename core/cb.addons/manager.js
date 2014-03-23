var _ = require('lodash');
var Q = require("q");
var fs  =  require('fs');
var path = require('path');
var express = require('express');
var Gittle = require('gittle');
var wrench = require('wrench');
var exec = require('child_process').exec;

var Addon = require("./addon");

// Load addons list from a directory return as a map name -> addon
var loadAddonsInfos = function(addonOptions, addonsRoot, _options) {
    // Directory to explore
    addonsRoot = addonsRoot;

    // Options
    _options = _.defaults({}, _options || {}, {
        ignoreError: true,
        unlinkInvalid: false
    });

    // Addons options
    addonOptions = _.defaults(addonOptions || {}, {
        logger: console
    });

    return Q.nfcall(fs.readdir, addonsRoot).then(function(dirs) {
        return _.reduce(dirs, function(previous, dir) {
            return previous.then(function(addons) {
                if (dir.indexOf('.') == 0) return Q(addons);

                var addonPath = path.join(addonsRoot, dir);
                var addon = new Addon(addonPath, addonOptions);
                return addon.load()
                .then(function() {
                    addons[addon.infos.name] = addon;
                    return Q(addons);
                }, function(err) {
                    addonOptions.logger.error("error", err);
                    if (_options.unlinkInvalid) {
                        //  When ignoring error
                        //  it will check that the addon is not a symlink
                        //  and unlink invalid ones
                        addonOptions.logger.error("ignore invalid addon", addonPath);
                        return addon.isSymlink().then(function(symlink) {
                            if (symlink) {
                                addonOptions.logger.error("unlink invalid addon:", addon.root);
                                return addon.unlink();
                            }
                        }).then(function() {
                            return Q(addons);
                        }, function() {
                            return Q(addons);
                        });
                    }
                    
                    if (_options.ignoreError) return Q(addons);
                    return Q.reject(err);
                });
            });
        }, Q({}));
    });
};

// Run an operation for a collection fo addons
var runAddonsOperation = function(operation, options) {
    options = _.defaults(options || {}, {
        failOnError: true
    });

    var failedAddons = [];

    return function(addons) {
        return Q.all(_.map(addons, function(addon) {
            return Q(operation(addon)).then(function() {
                return addon;
            }, function(err) {
                if (options.failOnError) {
                    return Q.reject(err);
                } else {
                    failedAddons.push(addon.infos.name);
                    return Q();
                }
            });
        })).then(function() {
            return Q(_.omit(addons, failedAddons));
        });
    };
};

module.exports = {
    loadAddonsInfos: loadAddonsInfos,
    runAddonsOperation: runAddonsOperation
};