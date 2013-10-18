// Requires
var HttpRPCManager = require('./manager').HttpRPCManager;


function setup(options, imports, register) {
    // Import
    var app = imports.server.app;
    var logger = imports.logger.namespace("httpRPC");

    // Construct
    var manager = new HttpRPCManager(app, '/api/', logger);

    // Register
    register(null, {
        "httpRPC": {
            register: manager.register
        }
    });
}

// Exports
module.exports = setup;
