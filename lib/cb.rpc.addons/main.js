// Requires
var AddonsRPCService = require('./service').AddonsRPCService;


function setup(options, imports, register) {
    // Import
    var httpRPC = imports.httpRPC;
    var workspace = imports.workspace;

    var service = new AddonsRPCService(workspace);

    // Register RPC
    httpRPC.register('/addons', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
