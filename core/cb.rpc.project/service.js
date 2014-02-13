// Requires
var Q = require('q');
var _ = require('underscore');

function ProjectRPCService(project, projectTypes, projectDeploy) {
    this.project = project;
    this.projectTypes = projectTypes;
    this.projectDeploy = projectDeploy;

    _.bindAll(this);
}

ProjectRPCService.prototype._reprProjectType = function(projectType) {
    return {
        'id': projectType.id,
        'name': projectType.name,
        'sample': projectType.sample != null
    };
};

ProjectRPCService.prototype.detect = function(args) {
    return this.project.detect().then(function(p) {
        return p.reprData();
    });
};

ProjectRPCService.prototype.supported = function(args) {
    return _.map(this.projectTypes.SUPPORTED, this._reprProjectType, this)
};

ProjectRPCService.prototype.useSample = function(args) {
    var that = this;
    if (!args.sample) throw "Need 'sample' argument";
    return this.projectTypes.useSample(args.sample).then(function(projectType) {
        return that._reprProjectType(projectType);
    });
};

ProjectRPCService.prototype.deployment_solution = function(args) {
    var that = this;
    if (!args.solution) throw "Need 'solution' argument";
    var solution = this.projectDeploy.get(args.solution);
    if (!solution) throw "Invalid solution";
    return solution.reprData();
};

// Exports
exports.ProjectRPCService = ProjectRPCService;
