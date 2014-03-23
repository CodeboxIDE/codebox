var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var addonsManager = require('../core/cb.addons/manager'); 

module.exports = function(grunt) {
    grunt.registerMultiTask('buildAddons', 'Build default add-ons', function() {
        var done = this.async();

        _.defaults(this.data, {
            force: true
        });

        var folder = this.data.addonsFolder;
        var force = this.data.force;

        grunt.log.writeln("Building addons in "+folder+" (force="+force+")");

        addonsManager.loadAddonsInfos({}, folder)
        .then(addonsManager.runAddonsOperation(function(addon) {
            if (!addon.hasDependencies() || addon.areDependenciesInstalled()) return;

            // Install dependencies
            return addon.installDependencies();
        }, {
            failOnError: false
        }))
        .then(addonsManager.runAddonsOperation(function(addon) {
            return addon.optimizeClient(force);
        }, {
            failOnError: false
        }))
        .then(function() {
            done();
        }, function(err) {
            grunt.log.error(err);
            done(false);
        });
    });
};