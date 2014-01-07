// Requires
var UsersRPCService = require('./service').UsersRPCService;


function setup(options, imports, register) {
    // Import
    var rpc = imports.rpc;
    var workspace = imports.workspace;

    var service = new UsersRPCService(workspace);

    // Register RPC
    rpc.register('/users', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
