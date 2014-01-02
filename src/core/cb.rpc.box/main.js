// Requires
var BoxRPCService = require('./service').BoxRPCService;


function setup(options, imports, register) {
    // Import
    var rpc = imports.rpc;
    var workspace = imports.workspace;

    var service = new BoxRPCService(workspace);

    // Register RPC
    rpc.register('/box', service, {
        auth: false
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
