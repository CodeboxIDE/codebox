// Requires
var Q = require('q');
var _ = require('lodash');

function AuthRPCService(workspace, hooks) {
    this.workspace = workspace;
    this.hooks = hooks;

    _.bindAll(this);
}

AuthRPCService.prototype.join = function(args, meta) {
	var that = this;
	
    meta.req.session.userId = null;
    
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
    
    return this.hooks.use("settings", {
        'settings': args,
        'auth': {
            'box': this.workspace.id,
            'userId': meta.user.userId,
            'token': meta.user.token
        }
    }).then(function(settings) {
        meta.user.settings = settings;
        return Q(meta.user.settings);
    });
};

// Exports
exports.AuthRPCService = AuthRPCService;
