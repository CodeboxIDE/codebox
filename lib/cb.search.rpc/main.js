// Requires
var SearchRPCService = require('./service').SearchRPCService;


function setup(options, imports, register) {
    // Import
    var search = imports.search;
    var httpRPC = imports.httpRPC;

    // Service
    var service = new SearchRPCService(search);

    // Register RPC
    httpRPC.register('search', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
