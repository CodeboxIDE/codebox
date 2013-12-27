// Requires
var ShellsRPCService = require('./service').ShellsRPCService;


function setup(options, imports, register) {
    // Import
    var shells = imports.shells;
    var httpRPC = imports.httpRPC;

    // Service
    var service = new ShellsRPCService(shells);

    // Register RPC
    httpRPC.register('shells', service);

    // Register
    register(null, {
        shells_rpc: service,
    });
}

// Exports
module.exports = setup;
