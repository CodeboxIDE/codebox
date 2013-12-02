// Requires
var Q = require('q');
var _ = require('underscore');

function ProcRPCService(search) {
    this.proc = proc;

    _.bindAll(this);
}

ProcRPCService.prototype.http = function(args) {
    return this.proc.http();
};

// Exports
exports.ProcRPCService = ProcRPCService;
