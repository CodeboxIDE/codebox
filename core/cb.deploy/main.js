// Requires
var _ = require('lodash');
var DeploymentSolution = require("./solution").DeploymentSolution;

// List of all deployment solution
var SUPPORTED = [];

function setup(options, imports, register) {
    // Import
    var logger = imports.logger.namespace("deployment");
    var events = imports.events;
    var workspace = imports.workspace;

    // Return a specific solution
    var getSolution = function(solutionId) {
        return _.find(SUPPORTED, function(solution) {
            return solution.infos.id == solutionId;
        });
    };

    // Add a solution
    var addSolution = function(solution) {
        if (!_.isArray(solution)) solution = [solution];
        _.each(solution, function(_sol) {
            SUPPORTED.push(new DeploymentSolution(workspace, events, logger, _sol));
        });
    };

    // Register
    register(null, {
        'deploy': {
            'SUPPORTED': SUPPORTED,
            'get': getSolution,
            'add': addSolution
        }
    });
}

// Exports
module.exports = setup;
