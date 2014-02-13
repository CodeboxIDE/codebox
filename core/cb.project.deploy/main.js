// Requires
var _ = require('underscore');
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
        return _.find(SOLUTIONS, function(solution) {
            return solution.id == solutionId;
        });
    };

    // Add a solution
    var addSolution = function(solution) {
        if (!_.isArray(solution)) solution = [solution];
        _.each(solution, function(_sol) {
            SUPPORTED.push(new DeploymentSolution(workspace, events, logger, _sol));
        });
    }


    // Add basic solutions
    addSolution([
        require("./ghpages")
    ])

    // Register
    register(null, {
        'projectDeploy': {
            'SUPPORTED': SUPPORTED,
            'get': getSolution
        }
    });
}

// Exports
module.exports = setup;
