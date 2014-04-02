// Requires
var Q = require('q');
var _ = require('lodash');
var wrench = require('wrench');
var path = require('path');

var utils = require('../utils');
var ProjectType = require('./project').ProjectType;

// Supported project types
// This list is ordered
var SUPPORTED = [
    // PaaS
    require("./appengine"),
    require("./procfile"),
    require("./parse"),
    require("./maven"),

    // Frameworks
    require("./django"),
    require("./gradle"),
    require("./grails"),
    require("./meteor"),

    // Languages
    require("./c"),
    require("./d"),
    require("./dart"),
    require("./go"),
    require("./clojure"),
    require("./java"),
    require("./logo"),
    require("./php"),
    require("./node"),
    require("./play"),
    require("./python"),
    require("./ruby"),
    require("./scala"),
    require("./lua"),

    // Fallbacks
    require("./static"),
    require("./makefile")
];


// Returns true if lang is supported otherwise false
function supports(projectDir, projectType) {
    // No detector
    if (!projectType.detector) {
        return Q(false);
    }

    // Detection script
    return utils.execFile('/bin/bash', [projectType.detector, projectDir])
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
        return _.chain(SUPPORTED)
        .filter(function(lang, idx) {
            return supported_list[idx];
        })
        .value();
    })
    .fail(utils.constant([]));
};


// Merge into one project type
var detectProject = function(workspace, project) {
    return detectProjectTypes(workspace.root).then(function(_types) {
        if (!_.size(_types)) {
            project.clear();
            return Q.reject(new Error("No project detected for this workspace"));
        }

        // Define new project
        return project.define(_types);
    }).then(function() {
        return project;
    });
};

// Get project type info by id
var getProjectType = function(typeId) {
    return _.find(SUPPORTED, function(pType) {
        return pType.id == typeId || _.contains(pType.otherIds, typeId);
    });
};

// Set project sample
// Tke a project type id and replace workspace content with it
var useProjectSample = function(root, typeId) {
    var pType = getProjectType(typeId);
    if (!pType) return Q.reject(new Error("Invalid project type id"));
    if (!pType.sample) return Q.reject(new Error("This project type has no sample"));


    return utils.exec('rm -rf ./*', {
        cwd: root
    })
    .then(function() {
        return utils.exec('cp -R ./* "'+root+'"', {
            cwd: pType.sample
        });
    });
};


function setup(options, imports, register) {
    var workspace = imports.workspace;
    var events = imports.events;
    var logger = imports.logger.namespace("project");
    var prev = Q();

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

    return Q().then(function() {
        if (!options.forceProjectSample) return;
        logger.log("set workspace content with sample", options.forceProjectSample)
        return useProjectSample(workspace.root, options.forceProjectSample).fail(function(err) {
            logger.exception(err, false);
            return Q();
        })
    })
    .then(function() {
        return {
            "project": project,
            "projectTypes": {
                "SUPPORTED": SUPPORTED,
                'add': function addProjectType(module) {
                    SUPPORTED.push(module);
                    return project.detect();
                },
                'useSample': function(typeId) {
                    return useProjectSample(workspace.root, typeId).then(function(pType) {
                        // Update project type
                        project.detect();
                        return pType;
                    });
                }
            }
        }
    });
}

// Exports
module.exports = setup;
