// Requires
var SearchRPCService = require('./service').SearchRPCService;


function setup(options, imports, register) {
    // Import
    var search = imports.search;
    var rpc = imports.rpc;

    // Service
    var service = new SearchRPCService(search);

    // Register RPC
    rpc.register('search', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
