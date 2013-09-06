// Requires
var HttpRPCManager = require('./manager').HttpRPCManager;


function setup(options, imports, register) {
    // Import
    var app = imports.server.app;

    // Construct
    var manager = new HttpRPCManager(app, '/rpc');

    // Register
    register(null, {
        "httpRPC": {
            register: manager.register
        }
    });
}

// Exports
module.exports = setup;
