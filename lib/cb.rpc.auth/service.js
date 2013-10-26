// Requires
var Q = require('q');
var _ = require('underscore');
var qsuccess = require('../utils').qsuccess;

function AuthRPCService(workspace, hooks) {
    this.workspace = workspace;
    this.hooks = hooks;

    _.bindAll(this);
}

AuthRPCService.prototype.join = function(args, meta) {
	var that = this;
	
	return this.hooks.use("auth", {
		'email': args.email,
		'token': args.token
	}).then(function(userInfo) {
		return that.workspace.authUser(userInfo);
	}).then(function(user) {
        // Set userId
        meta.req.session.userId = user.userId;

        return qsuccess(user.info());
    });
};

// Exports
exports.AuthRPCService = AuthRPCService;
