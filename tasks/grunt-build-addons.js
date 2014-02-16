'use strict';

var fs = require('fs');
var path = require('path');

var addonsManager = require('../core/cb.addons/manager'); 

module.exports = function(grunt) {
    grunt.registerMultiTask('buildAddons', 'Build default add-ons', function() {
        var done = this.async();

        var folder = this.data.addonsFolder;
        grunt.log.writeln("Building addons in "+folder);

        addonsManager.loadAddonsInfos({}, folder)
        .then(addonsManager.runAddonsOperation(function(addon) {
            return addon.optimizeClient(true);
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