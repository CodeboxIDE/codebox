// Requires
var Q = require('q');
var _ = require('underscore');


function AddonsRPCService(addons, workspace) {
    this.workspace = workspace;
    this.addons = addons;

    _.bindAll(this);
}

AddonsRPCService.prototype.list = function(args, meta) {
    return Q(this.addons.info);
};

AddonsRPCService.prototype.install = function(args, meta) {
	/* TODO: install an addon from a git repository */
    return Q([]);
};

AddonsRPCService.prototype.uninstall = function(args, meta) {
	/* TODO: uninstall an addon */
    return Q([]);
};

// Exports
exports.AddonsRPCService = AddonsRPCService;
