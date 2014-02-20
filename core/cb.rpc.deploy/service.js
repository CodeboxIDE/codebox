// Requires
var Q = require('q');
var _ = require('lodash');

function DeployRPCService(deploy, events) {
    this.deploy = deploy;
    this.events = events;

    _.bindAll(this);
}


// Return all deployment solution
DeployRPCService.prototype.solutions = function(args) {
    return _.map(this.deploy.SUPPORTED, function(solution) {
        return solution.reprData();
    });
};

// Run deployment
DeployRPCService.prototype.run = function(args, meta) {
    if (!args.solution
    || !args.config
    || !args.action) throw "Need 'solution', 'action' and 'config' arguments";

    var solution = this.deploy.get(args.solution);
    if (!solution) throw "Invalid solution: '"+args.solution+"'";

    var action = solution.action(args.action);
    if (!action) throw "Invalid action: '"+args.action+"'";

    this.events.emit("deploy.run", {
        'userId': meta.user.userId,
        'solution': args.solution
    });

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
