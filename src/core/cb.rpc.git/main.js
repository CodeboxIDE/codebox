// Requires
var GitRPCService = require('./service').GitRPCService;


function setup(options, imports, register) {
    // Import
    var git = imports.git;
    var rpc = imports.rpc;
    var events = imports.events;

    // Service
    var service = new GitRPCService(git.repo, events);

    // Register RPC
    rpc.register('git', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
