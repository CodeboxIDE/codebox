// Requires
var Q = require('q');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var pkg = require('../../package.json');

function BoxRPCService(workspace, project) {
    this.workspace = workspace;
    this.projectDetector = project;

    _.bindAll(this);
}

BoxRPCService.prototype.status = function(args, meta) {
    return Q({
        'version': pkg.version,
        'status': "ok",
        'name': this.workspace.name,
        'public': this.workspace.public,
        'uptime': process.uptime(),
        'mtime': this.workspace.mtime,
        'collaborators': this.workspace.userCount()
    });
};

BoxRPCService.prototype.ping = function(args, meta) {
    return Q({
        'ping': true
    });
};

BoxRPCService.prototype.project = function(args, meta) {
    return this.projectDetector.detect().then(function(project) {
        return project.reprData();
    });
};

BoxRPCService.prototype.changes = function(args, meta) {
    var changelogPath = path.resolve(__dirname, "../../CHANGES");
    return Q.nfapply(fs.readFile, [
        changelogPath, "utf-8"
    ]).then(function (text) {
        return {
            'version': pkg.version,
            'content': text
        }
    });
};

// Exports
exports.BoxRPCService = BoxRPCService;
