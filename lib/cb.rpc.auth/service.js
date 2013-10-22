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
	var token = args.token;
	
	return this.hooks.use("auth", {
		'token': token
	}).then(function(userInfo) {
		return that.workspace.authUser(userInfo);
	}).then(function(user) {
        // Set userId
        meta.req.session.userId = user.userId;
    });
};

// Exports
exports.AuthRPCService = AuthRPCService;
