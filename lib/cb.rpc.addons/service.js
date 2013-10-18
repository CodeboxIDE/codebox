// Requires
var Q = require('q');
var _ = require('underscore');


function AddonsRPCService(workspace) {
    this.workspace = workspace;

    _.bindAll(this);
}

AddonsRPCService.prototype.list = function(args, meta) {
	/* TODO: list addons from diretcory /addons by reading their manifest.json */
    return Q([]);
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
