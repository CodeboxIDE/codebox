// Requires
var Q = require('q');
var _ = require('lodash');


function AddonsRPCService(addons, workspace) {
    this.workspace = workspace;
    this.addons = addons;

    _.bindAll(this);
}

AddonsRPCService.prototype.registry = function(args, meta) {
    if (!args.url) {
        return Q.reject(new Error("Need 'url' argument"));
    }
    return this.addons.registry(args.url);
};

AddonsRPCService.prototype.list = function(args, meta) {
    return this.addons.list().then(function(addons) {
        return _.map(addons, function(addon) {
            return addon.infos;
        });
    })
};

AddonsRPCService.prototype.install = function(args, meta) {
	if (!args.git) {
        return Q.reject(new Error("Need 'git' argument"));
    }
    return this.addons.install(args.git).then(function(addon) {
        return addon.infos;
    });
};

AddonsRPCService.prototype.uninstall = function(args, meta) {
	if (!args.name) {
        return Q.reject(new Error("Need 'name' argument"));
    }
    return this.addons.uninstall(args.name);
};

// Exports
exports.AddonsRPCService = AddonsRPCService;
