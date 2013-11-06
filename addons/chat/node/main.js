var ChatRPCService = require('./service').ChatRPCService;

function setup(options, imports, register) {
    // Import
    var httpRPC = imports.httpRPC;
    var events = imports.events;
    var logger = imports.logger.namespace("heroku", true);

    var service = new ChatRPCService(events, logger);

    // Register RPC
    httpRPC.register('/chat', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
