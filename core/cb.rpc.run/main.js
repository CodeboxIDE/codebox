// Requires
var RunRPCService = require('./service').RunRPCService;


function setup(options, imports, register) {
    // Import
    var rpc = imports.rpc;
    var workspace = imports.workspace;

    var run_file = imports.run_file;
    var run_project = imports.run_project;
    var run_ports = imports.run_ports;
    var project = imports.project;

    var service = new RunRPCService(
        workspace,
        run_file,
        run_project,
        run_ports,
        project
    );

    // Register RPC
    rpc.register('/run', service);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
