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

        return Q(user.info());
    });
};

AuthRPCService.prototype.settings = function(args, meta) {
    var that = this;
    
    return this.hooks.use("settings", args).then(function(settings) {
        meta.user.settings = settings;
        return Q(meta.user.settings);
    });
};

// Exports
exports.AuthRPCService = AuthRPCService;
