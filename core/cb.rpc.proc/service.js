// Requires
var Q = require('q');
var _ = require('lodash');

function ProcRPCService(proc) {
    this.proc = proc;

    _.bindAll(this);
}

ProcRPCService.prototype.http = function(args) {
    return this.proc.http();
};

// Exports
exports.ProcRPCService = ProcRPCService;
