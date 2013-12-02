// Requires
var ProcRPCService = require('./service').ProcRPCService;


function setup(options, imports, register) {
    // Import
    var proc = imports.proc;
    var httpRPC = imports.httpRPC;

    // Service
    var service = new ProcRPCService(proc);

    // Register RPC
    httpRPC.register('proc', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
