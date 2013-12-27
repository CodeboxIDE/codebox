// Requires
var Q = require('q');
var _ = require('underscore');

var path = require('path');
var utils = require('../utils');

// No project detected
var NONE = null;

// Supported languages and project types
var SUPPORTED = [
    'clojure',
    'gradle',
    'grails',
    'java',
    'logo',
    'nodejs',
    'php',
    'play',
    'python',
    'ruby',
    'scala',
    'static',
];

// Path to detection script
function scriptPath(lang) {
    return path.resolve(__dirname, 'detectors', lang + '.sh');
}

// Returns true if lang is supported otherwise false
function supports(projectDir, lang) {
    return utils.execFile(scriptPath(lang), [projectDir])
    .then(
        utils.constant(true),
        utils.constant(false)
    );
}

// All the project types
function projectTypes(projectDir) {
    var _supports = _.partial(supports, projectDir);

    // Try all our project types, return first supported
    // if none supported return NONE
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
    .fail(utils.constant([NONE]));
}

// The "first", considered to be the main
function projectType(projectDir) {
    return projectTypes(projectDir).get(0);
}


function setup(options, imports, register) {
    var workspace = imports.workspace;

    // Partialize functions with workspace root
    var detector = _.partial(projectType, workspace.root);
    var types = _.partial(projectTypes, workspace.root);

    register(null, {
        "project_detect": {
            // Get main type of the current workspace
            main: detector,

            // Get all types (if many) for the current workspace
            all: types,

            // Detect for any given folder
            detect: projectType,

            // List of supported types
            SUPPORTED: SUPPORTED,
            NONE: NONE
        }
    });
}

// Exports
module.exports = setup;
