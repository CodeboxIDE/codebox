// Requires
var _ = require('lodash');
var Gittle = require('gittle');
var GitRPCService = require('./service').GitRPCService;


function setup(options, imports, register) {
    // Import
    var rpc = imports.rpc;
    var events = imports.events;
    var workspace = imports.workspace;

    // Service
    var service = new GitRPCService(workspace, events);

    // Register RPC
    rpc.register('git', service);

    // Register
    register(null, {
        "git": {
            repo: service.repo,
        },
        "git_rpc": service
    });
}

// Exports
module.exports = setup;
