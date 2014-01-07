// Requires
var ShellsRPCService = require('./service').ShellsRPCService;


function setup(options, imports, register) {
    // Import
    var shells = imports.shells;
    var rpc = imports.rpc;

    // Service
    var service = new ShellsRPCService(shells);

    // Register RPC
    rpc.register('shells', service);

    // Register
    register(null, {
        shells_rpc: service,
    });
}

// Exports
module.exports = setup;
