// Requires
var AuthRPCService = require('./service').AuthRPCService;


function setup(options, imports, register) {
    // Import
    var rpc = imports.rpc;
    var workspace = imports.workspace;
    var hooks = imports.hooks;

    var service = new AuthRPCService(workspace, hooks);

    // Register RPC
    rpc.register('/auth', service, {
        auth: false
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
