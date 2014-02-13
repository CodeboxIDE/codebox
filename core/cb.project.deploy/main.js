// Requires
var _ = require('underscore');
var DeploymentSolution = require("./solution").DeploymentSolution;

// List of all deployment solution
var SOLUTIONS = [
    require("./ghpages")
];

function setup(options, imports, register) {
    // Import
    var logger = imports.logger.namespace("deployment");
    var events = imports.events;
    var workspace = imports.workspace;

    var getSolution = function(solutionId) {
        var solution = _.find(SOLUTIONS, function(solution) {
            return solution.id == solutionId;
        });
        if (!solution) return null;
        return new DeploymentSolution(workspace, events, logger, solution)
    };

    // Register
    register(null, {
        'projectDeploy': {
            'SOLUTIONS': SOLUTIONS,
            'get': getSolution
        }
    });
}

// Exports
module.exports = setup;
