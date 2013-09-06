// Requires
var ShellsRPCService = require('./service').ShellsRPCService;


function setup(options, imports, register) {
    // Import
    var shells = imports.shells;
    var httpRPC = imports.httpRPC;

    // Service
    var service = new ShellsRPCService(shells.manager);

    // Register RPC
    httpRPC.register('shells', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
