// Requires
var ProcRPCService = require('./service').ProcRPCService;


function setup(options, imports, register) {
    // Import
    var proc = imports.proc;
    var rpc = imports.rpc;

    // Service
    var service = new ProcRPCService(proc);

    // Register RPC
    rpc.register('proc', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
