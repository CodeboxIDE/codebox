// Requires
var Q = require('q');
var _ = require('underscore');

var path = require('path');
var utils = require('../utils');

var ProjectType = require('./project').ProjectType;

// Supported project types
// This list is ordered
var SUPPORTED = [
    require("./makefile"),
    require("./procfile"),
    require("./d"),
    require("./go"),
    require("./clojure"),
    require("./gradle"),
    require("./grails"),
    require("./java"),
    require("./logo"),
    require("./php"),
    require("./nodejs"),
    require("./play"),
    require("./python"),
    require("./ruby"),
    require("./scala"),
    require("./static")
];

// Returns true if lang is supported otherwise false
function supports(projectDir, projectType) {
    // No detector
    if (!projectType.detector) {
        return Q(false);
    }

    // Detection script
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


// Merge into one project type
var detectProject = function(workspace, project) {
    return detectProjectTypes(workspace.root).then(function(_types) {
        project.clear();
        if (!_.size(_types)) return Q.reject(new Error("No project detected for this workspace"));

        // Define new project
        return project.define(_types);
    }).then(function() {
        return project;
    });
};


function setup(options, imports, register) {
    var workspace = imports.workspace;
    var events = imports.events;
    var logger = imports.logger.namespace("project");

    // Create the project type
    var project = new ProjectType(workspace, events, logger);

    // Do the project detection manually
    project.detect = _.partial(detectProject, workspace, project);

    // Detect the project when the fs change
    var throttled = _.throttle(project.detect, 5*60*1000);
    events.on("watch.change.update", throttled);
    events.on("watch.change.create", throttled);
    events.on("watch.change.delete", throttled);
    events.on("watch.watching.success", throttled);

    register(null, {
        "project": project,
        "projectTypes": {
            'add': function addProjectType(module) {
                SUPPORTED.push(module);
                return project.detect();
            }
        }
    });
}

// Exports
module.exports = setup;
