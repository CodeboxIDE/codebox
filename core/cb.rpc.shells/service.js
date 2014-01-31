// Requires
var Q = require('q');
var _ = require('lodash');


function ShellsRPCService(manager) {
    this.manager = manager;

    _.bindAll(this);
}

ShellsRPCService.prototype._getShell = function(id) {
    if(!id) {
        return Q.reject(new Error("Missing Shell ID"));
    } else if(this.manager.shells[id]) {
        return Q(this.manager.shells[id].ps);
    }
    return Q.reject(new Error("Shell '"+ id +"' does not exist"));
};

ShellsRPCService.prototype.status = function() {
    return Q.nfcall(this.manager.status);
};

ShellsRPCService.prototype.list = function(args) {
    return Q(_.keys(this.manager.shells));
};

ShellsRPCService.prototype.destroy = function(args) {
    args.id = args.id || args.shellId;
    return this._getShell(args.id)
    .then(function(shell) {
        return shell.destroy();
    });
};

ShellsRPCService.prototype.resize = function(args) {
    args.id = args.id || args.shellId;
    return this._getShell(args.id)
    .then(function(shell) {
        return shell.resize(args.columns, args.rows);
    });
};

// Exports
exports.ShellsRPCService = ShellsRPCService;
