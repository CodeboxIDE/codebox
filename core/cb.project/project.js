var Q = require('q');
var _ = require('underscore');
var path = require('path');
var utils = require('../utils');


function Project(workspace, type) {
    this.workspace = workspace;
    this.type = type;

    _.bindAll(this);
};

// Exports
exports.Project = Project;
