// Requires
var _ = require('underscore');
var Gittle = require('gittle');
var GitRPCService = require('./service').GitRPCService;


function setup(options, imports, register) {
    // Import
    var rpc = imports.rpc;
    var events = imports.events;
    var workspace = imports.workspace;

    // Construct
    var repo = new Gittle(workspace.root);

    // Service
    var service = new GitRPCService(repo, events);

    // Register RPC
    rpc.register('git', service);

    // Register
    register(null, {
        "git": {
            repo: repo,
        },
        "git_rpc": service
    });
}

// Exports
module.exports = setup;
