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
        console.log("Auth user ", user.userId);
        meta.req.session.userId = user.userId;
    });
};

// Exports
exports.AuthRPCService = AuthRPCService;
