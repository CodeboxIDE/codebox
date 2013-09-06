// Requires
var Q = require('q');
var _ = require('underscore');

// Utility function for fail promises
var qfail = require('../utils').qfail;


function ShellsRPCService(manager) {
    this.manager = manager;

    _.bindAll(this);
}

ShellsRPCService.prototype._getShell = function(id) {
    if(!id) {
        return qfail(new Error("Missing Shell ID"));
    } else if(this.manager.shells[id]) {
        return Q(this.manager.shells[id].ps);
    }
    return qfail(new Error("Shell '"+ id +"' does not exist"));
};

ShellsRPCService.prototype.status = function() {
    return Q.nfcall(this.manager.status);
};

ShellsRPCService.prototype.list = function(args) {
    return Q(_.keys(this.manager.shells));
};

ShellsRPCService.prototype.destroy = function(args) {
    return this._getShell(args.id)
    .then(function(shell) {
        return shell.destroy();
    });
};

ShellsRPCService.prototype.resize = function(args) {
    return this._getShell(args.id)
    .then(function(shell) {
        return shell.resize(args.columns, args.rows);
    });
};

// Exports
exports.ShellsRPCService = ShellsRPCService;
