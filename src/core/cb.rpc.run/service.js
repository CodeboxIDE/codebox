// Requires
var Q = require('q');
var _ = require('underscore');

var path = require('path');


function RunRPCService(workspace, run_file, run_project, run_ports) {
    this.workspace = workspace;

    this.run_file = run_file;
    this.run_project = run_project;
    this.run_ports = run_ports;

    _.bindAll(this);
}

RunRPCService.prototype.project = function(args, meta) {
    return Q(this.run_project.run());
};

RunRPCService.prototype.file = function(args, meta) {
    // We need to be supplied a file to execute
    if(!args.file) {
        return Q.reject('Missing "file" argument');
    }

    return Q(this.run_file.run(
        // Get full path
        path.join(this.workspace.root, args.file)
    ));
};

RunRPCService.prototype.ports = function(args, meta) {
    return Q(this.run_ports.ports);
};

// Exports
exports.RunRPCService = RunRPCService;
