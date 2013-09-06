// Requires
var GitRPCService = require('./service').GitRPCService;


function setup(options, imports, register) {
    // Import
    var git = imports.git;
    var httpRPC = imports.httpRPC;

    // Service
    var service = new GitRPCService(git.repo);

    // Register RPC
    httpRPC.register('git', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
