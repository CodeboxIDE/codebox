// Requires
var GitRPCService = require('./service').GitRPCService;


function setup(options, imports, register) {
    // Import
    var git = imports.git;
    var httpRPC = imports.httpRPC;
    var events = imports.events;

    // Service
    var service = new GitRPCService(git.repo, events);

    // Register RPC
    httpRPC.register('git', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
