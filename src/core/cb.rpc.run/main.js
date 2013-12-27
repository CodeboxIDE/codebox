// Requires
var RunRPCService = require('./service').RunRPCService;


function setup(options, imports, register) {
    // Import
    var httpRPC = imports.httpRPC;
    var workspace = imports.workspace;

    var run_file = imports.run_file;
    var run_project = imports.run_project;
    var run_ports = imports.run_ports;

    var service = new RunRPCService(
        workspace,
        run_file,
        run_project,
        run_ports
    );

    // Register RPC
    httpRPC.register('/run', service, {
        auth: false
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
