// Requires
var CodeCompleteRPCService = require('./service').CodeCompleteRPCService;


function setup(options, imports, register) {
    // Import
    var rpc = imports.rpc;
    var codecomplete = imports.codecomplete;

    var service = new CodeCompleteRPCService(codecomplete);

    // Register RPC
    rpc.register('/codecomplete', service, {
        auth: false // just for tetsing: to remove
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
