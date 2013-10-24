// Requires
var Q = require('q');
var _ = require('underscore');


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
    });
};

// Exports
exports.AuthRPCService = AuthRPCService;
