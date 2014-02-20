// Requires
var Q = require('q');
var _ = require('lodash');

var path = require('path');


function RunRPCService(workspace, run_file, run_project, run_ports, project) {
    this.workspace = workspace;
    this.projectType = project;

    this.run_file = run_file;
    this.run_project = run_project;
    this.run_ports = run_ports;

    _.bindAll(this);
}

RunRPCService.prototype.project = function(args, meta) {
    return Q(this.run_project.run(args));
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

RunRPCService.prototype.list = function(args, meta) {
    return this.projectType.detect().then(function(project) {
        return project.getRunner(args);
    })
};

// Exports
exports.RunRPCService = RunRPCService;
