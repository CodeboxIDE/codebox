// Requires
var Q = require('q');
var _ = require('underscore');
var timestamp = require('../utils').timestamp;

function User(data) {
    // Copy data to this
    _.defaults(data, {
        'mtime': timestamp()
    });
    _.extend(this, data);

    _.bindAll(this);
}

User.prototype.isValid = function() {
    return _.size(_.pick(this.info(), 'userId', 'name', 'email', 'image', 'token')) > 0;
};

User.prototype.isActif = function(d) {
    d = d || 3600; // 1 hour
    return this.mtime > (timestamp() - d);
};

User.prototype.activate = function() {
    this.mtime = timestamp();
};

User.prototype.info = function() {
    return _.pick(this,
        'userId',
        'token',
        'name',
        'email',
        'image',
        'mtime'
    );
};

User.prototype.publicInfo = function() {
    return _.omit(this.info(), 'token');
};

// Exports
exports.User = User;