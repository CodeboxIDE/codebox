// Requires
var Q = require('q');
var _ = require('lodash');

function ProjectRPCService(project, projectTypes) {
    this.project = project;
    this.projectTypes = projectTypes;

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

// Exports
exports.ProjectRPCService = ProjectRPCService;
