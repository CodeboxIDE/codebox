// Requires
var Q = require('q');
var _ = require('underscore');


function AuthRPCService(workspace) {
    this.workspace = workspace;

    _.bindAll(this);
}

AuthRPCService.prototype.join = function(args, meta) {
    return this.workspace.authUser(meta.req.body)
    .then(function(user) {
        // Set userId
        meta.req.session.userId = user.userId;
    });
};

AuthRPCService.prototype.ping = function(args, meta) {
    return Q("pong");
};

// Exports
exports.AuthRPCService = AuthRPCService;
