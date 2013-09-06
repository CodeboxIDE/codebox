// Requires
var Q = require('q');
var _ = require('underscore');


function toBase(num, base) {
    return Number(Number(num).toString(base));
}


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

GitRPCService.prototype._normalizeDiff = function(d) {
    return {
        diff: d.diff,
        type: 'text',
        old: {
            path: d.a_path,
            mode: toBase(d.a_mode || d.b_mode, 8),
            sha: d.a_blob.id
        },
        'new': {
            path: d.b_path,
            mode: toBase(d.b_mode, 8),
            sha: d.b_blob.id
        }
    };
};

GitRPCService.prototype.diff = function(args) {
    var that = this;
    return Q.nfcall(this.repo.diff, args.new, args.old)
    .then(function(diffs) {
        return _.map(diffs, that._normalizeDiff);
    });
};

// Exports
exports.GitRPCService = GitRPCService;
