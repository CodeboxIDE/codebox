// Requires
var Q = require('q');
var _ = require('underscore');

var path = require('path');
var utils = require('../utils');

var Project = require('./project').Project;

// Supported project ids
var SUPPORTED = [
    require("./nodejs")
];

// Returns true if lang is supported otherwise false
function supports(projectDir, projectType) {
    // No detector
    if (!projectType.detector) {
        return Q(false);
    }

    // Detection script
    console.log("run ", projectType.detector, projectDir);
    return utils.execFile(projectType.detector, [projectDir])
    .then(
        utils.constant(true),
        utils.constant(false)
    );
}

// Detect the project type for a workspace
var detectProjectTypes = function(projectDir) {
    var _supports = _.partial(supports, projectDir);

    // Try all our project types, return first supported
    return Q.all(_.map(SUPPORTED, _supports))
    .then(function(supported_list) {
        var idx = supported_list.indexOf(true);
        if(idx === -1) {
            throw new Error("No supported project");
        }

        // List of supported project types
        return _.filter(SUPPORTED, function(lang, idx) {
            return supported_list[idx];
        });
    })
    .fail(utils.constant([null]));
};

// Return list of projects associated to a workspace
var detectProjects = function(workspace) {
    return detectProjectTypes(workspace.root).then(function(_types) {
        if (!_.size(_types)) return Q.reject(new Error("No project detected for this workspace"));
        return _.map(_types, function(_type) {
            return new Project(workspace, _type);
        });
    })
};

var detectProject = function(workspace) {
    return detectProjects(workspace).get(0);
};


function setup(options, imports, register) {
    var workspace = imports.workspace;

    var detect = _.partial(detectProject, workspace);

    register(null, {
        "project": {
            // Return project associated with this workspace
            detect: detect,

            // List of supported types
            SUPPORTED: SUPPORTED
        }
    });
}

// Exports
module.exports = setup;
