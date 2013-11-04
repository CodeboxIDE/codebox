// Requires
var HttpRPCManager = require('./manager').HttpRPCManager;


function setup(options, imports, register) {
    // Import
    var server = imports.server;
    var logger = imports.logger.namespace("rpc");

    // Construct
    var manager = new HttpRPCManager(server, '/rpc/', logger);

    // Register
    register(null, {
        "httpRPC": {
            register: manager.register
        }
    });
}

// Exports
module.exports = setup;
