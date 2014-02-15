// Requires
var ProjectRPCService = require('./service').ProjectRPCService;


function setup(options, imports, register) {
    // Import
    var project = imports.project;
    var projectTypes = imports.projectTypes;
    var rpc = imports.rpc;

    // Service
    var service = new ProjectRPCService(project, projectTypes);

    // Register RPC
    rpc.register('project', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
