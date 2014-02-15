// Requires
var Q = require('q');
var _ = require('underscore');

function DeployRPCService(deploy) {
    this.deploy = deploy;

    _.bindAll(this);
}


// Return all deployment solution
DeployRPCService.prototype.solutions = function(args) {
    return _.map(this.deploy.SUPPORTED, function(solution) {
        return solution.reprData();
    });
};

// Run deployment
DeployRPCService.prototype.run = function(args) {
    if (!args.solution
    || !args.config
    || !args.action) throw "Need 'solution', 'action' and 'config' arguments";

    var solution = this.deploy.get(args.solution);
    if (!solution) throw "Invalid solution: '"+args.solution+"'";

    var action = solution.action(args.action);
    if (!action) throw "Invalid action: '"+args.action+"'";

    return Q()
    .then(function() {
        return action.action(args.config);
    })
    .then(function(ret) {
        if (_.isString(ret)) ret = {'message': ret};
        return ret;
    });
};

// Exports
exports.DeployRPCService = DeployRPCService;
