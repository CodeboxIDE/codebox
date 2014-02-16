// Requires
var DeployRPCService = require('./service').DeployRPCService;


function setup(options, imports, register) {
    // Import
    var deploy = imports.deploy;
    var rpc = imports.rpc;

    // Service
    var service = new DeployRPCService(deploy);

    // Register RPC
    rpc.register('deploy', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
