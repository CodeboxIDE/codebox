// Requires
var Q = require('q');
var _ = require('underscore');

var qfail = require('../utils').qfail;


function GitRPCService(repo) {
    this.repo = repo;

    _.bindAll(this);
}

GitRPCService.prototype.status = function() {
    return this.repo.status();
};

GitRPCService.prototype.sync = function() {
    return this.repo.sync().then(Q(true));
};

GitRPCService.prototype.commit = function(args, meta) {
    var msg = args.message;
    var files = args.files || [];
    var name = meta.user.name;
    var email = meta.user.email;

    if(!_.all([msg, files, name, email])) {
        return qfail(new Error("Could not commit because arguments are missing and/or invalid"));
    }

    return this.repo.commit(name, email, msg, files);
};

GitRPCService.prototype.commits = function(args) {
    return this.repo.commits(args.ref, args.limit, args.skip);
};

GitRPCService.prototype.commits_pending = function() {
    return this.repo.commits_pending();
};

GitRPCService.prototype.diff = function(args) {
    return this.repo.diff(args.new, args.old);

};

GitRPCService.prototype.diff_working = function(args) {
    return this.repo.diff_working();

};

// Exports
exports.GitRPCService = GitRPCService;
