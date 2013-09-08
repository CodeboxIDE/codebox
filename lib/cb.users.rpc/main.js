// Requires
var UsersRPCService = require('./service').UsersRPCService;


function setup(options, imports, register) {
    // Import
    var httpRPC = imports.httpRPC;
    var workspace = imports.workspace;

    var service = new UsersRPCService(workspace);

    // Register RPC
    httpRPC.register('/users', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
