var Q = require('q');
var _ = require('underscore');
var path = require('path');
var utils = require('../utils');

function ProjectType(workspace, type) {
    this.workspace = workspace;
    _.extend(this, type, {

        // Rules of glob to ignore
        ignoreRules: [],

        // List of files with rules
        ignoreRulesFiles: []
    });

    // Add .gitignore
    this.ignoreRulesFiles = this.ignoreRulesFiles.concat([
        ".ignore",
        ".gitignore"
    ]);

    _.bindAll(this);
};

/*
 *  Return a list of all ignored directories
 */
ProjectType.prototype.getIgnoreRules = function() {
    // todo: read this.ignoreRulesFiles
    return Q(this.ignoreRules)
};


// Exports
exports.ProjectType = ProjectType;
