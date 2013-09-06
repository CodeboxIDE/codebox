// Requires
var Q = require('q');
var _ = require('underscore');


function GitRPCService(repo) {
    this.repo = repo;

    _.bindAll(this);
}

GitRPCService.prototype.status = function() {
    return Q.nfcall(this.repo.status);
};


GitRPCService.prototype.commits = function() {
    return Q.nfcall(this.repo.commits);
};

GitRPCService.prototype.diff = function(args) {
    return Q.nfcall(this.repo.diff, args.new, args.old);
};

// Exports
exports.GitRPCService = GitRPCService;
