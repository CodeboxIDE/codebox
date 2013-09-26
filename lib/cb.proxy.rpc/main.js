// Requires
var ProxyRPCService = require('./service').ProxyRPCService;


function setup(options, imports, register) {
    // Import
    var httpRPC = imports.httpRPC;

    var service = new ProxyRPCService();

    // Register RPC
    httpRPC.register('/proxy', service, {
        auth: false
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
