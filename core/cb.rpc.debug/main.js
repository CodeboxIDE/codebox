// Requires
var _ = require('lodash');
var DebugRPCService = require('./service').DebugRPCService;


function setup(options, imports, register) {
    // Import
    var rpc = imports.rpc;
    var events = imports.events;
    var workspace = imports.workspace;

    // Service
    var service = new DebugRPCService(workspace, events);

    // Register RPC
    rpc.register('debug', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
