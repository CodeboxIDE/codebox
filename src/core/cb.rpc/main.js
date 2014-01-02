// Requires
var HttpRPCManager = require('./manager').HttpRPCManager;


function setup(options, imports, register) {
    // Import
    var server = imports.server;
    var logger = imports.logger.namespace("rpc");

    // Construct
    var manager = new HttpRPCManager(server, '/rpc/', logger);

    var rpcObj = {
        register: manager.register
    };

    // Register
    register(null, {
        "rpc": rpcObj,

        // Alias, for retro compatibility reasons
        "httpRPC": rpcObj
    });
}

// Exports
module.exports = setup;
