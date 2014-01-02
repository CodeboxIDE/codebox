// Requires
var AddonsRPCService = require('./service').AddonsRPCService;


function setup(options, imports, register) {
    // Import
    var rpc = imports.rpc;
    var workspace = imports.workspace;
    var addons = imports.addons;

    var service = new AddonsRPCService(addons, workspace);

    // Register RPC
    rpc.register('/addons', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
