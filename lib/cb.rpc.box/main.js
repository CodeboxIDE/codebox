// Requires
var BoxRPCService = require('./service').BoxRPCService;


function setup(options, imports, register) {
    // Import
    var httpRPC = imports.httpRPC;
    var workspace = imports.workspace;

    var service = new BoxRPCService(workspace);

    // Register RPC
    httpRPC.register('/box', service, {
        auth: false
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
