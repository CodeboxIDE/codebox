// Requires
var Q = require('q');
var _ = require('underscore');

var qfail = require('../utils').qfail;


function GitRPCService(repo, events) {
    this.repo = repo;
    this.events = events;

    _.bindAll(this);
}

GitRPCService.prototype.status = function() {
    return this.repo.status();
};

GitRPCService.prototype.sync = function(args, meta) {
    var that = this;
    return this.repo.sync()
    .then(function() {
        that.events.emit('git.sync', {
            userId: meta.user.userId
        });
    });
};

GitRPCService.prototype.commit = function(args, meta) {
    var msg = args.message;
    var files = args.files || [];
    var name = meta.user.name;
    var email = meta.user.email;
    
    if(!_.all([msg, files, name, email])) {
        return qfail(new Error("Could not commit because arguments are missing and/or invalid"));
    }

    var that = this;
    return this.repo.commit(name, email, msg, files)
    .then(function() {
        that.events.emit('git.commit', {
            userId: meta.user.userId,

            message: msg,
            name: name,
            email: email,
            files: files
        });
    });
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
