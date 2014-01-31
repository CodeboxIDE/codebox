// Requires
var Q = require('q');
var _ = require('lodash');


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

GitRPCService.prototype.push = function(args, meta) {
    var that = this;
    return this.repo.push()
    .then(function() {
        that.events.emit('git.push', {
            userId: meta.user.userId
        });
    });
};

GitRPCService.prototype.pull = function(args, meta) {
    var that = this;
    return this.repo.pull()
    .then(function() {
        that.events.emit('git.pull', {
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
        return Q.reject(new Error("Could not commit because arguments are missing and/or invalid"));
    }

    var that = this;
    return this.repo.commitWith(name, email, msg, files)
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

GitRPCService.prototype.branches = function(args) {
    var activeBranch, that = this;

    // Get current active branch
    return this.repo.branch().then(function(branch) {
        activeBranch = branch;

        // Get all local branches
        return that.repo.branches();
    }).then(function(branches) {
        return _.map(branches, function(branch) {
            return {
                'name': branch.name,
                'active': branch.name == activeBranch.name
            }
        });
    })
};

GitRPCService.prototype.branch_create = function(args) {
    if (!args.name) return Q.reject(new Error("Need a name to create a branch"));
    return this.repo.create_branch(args.name);
};

GitRPCService.prototype.checkout = function(args) {
    if (!args.ref) return Q.reject(new Error("Need a referance (ref) to checkout"));
    return this.repo.checkout(args.ref);
};

GitRPCService.prototype.branch_delete = function(args) {
    if (!args.name) return Q.reject(new Error("Need a name to delete a branch"));
    return this.repo.delete_branch(args.name);
};

GitRPCService.prototype.commits_pending = function() {
    return this.repo.commits_pending();
};

GitRPCService.prototype.diff = function(args) {
    return this.repo.diff(args.new, args.old).then(function(diffs) {
        return _.map(diffs, function(diff) {
            return diff.normalize();
        })
    });
};

// Exports
exports.GitRPCService = GitRPCService;
