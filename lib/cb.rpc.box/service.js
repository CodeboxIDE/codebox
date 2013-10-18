// Requires
var Q = require('q');
var _ = require('underscore');


function BoxRPCService(workspace) {
    this.workspace = workspace;

    _.bindAll(this);
}

BoxRPCService.prototype.status = function(args, meta) {
    return Q({
        'status': "ok",
        'name': this.workspace.name,
        'uptime': process.uptime(),
        'mtime': this.workspace.mtime,
        'collaborators': this.workspace.userCount(),
    });
};

// Exports
exports.BoxRPCService = BoxRPCService;
