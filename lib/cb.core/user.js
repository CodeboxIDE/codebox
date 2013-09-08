// Requires
var Q = require('q');
var _ = require('underscore');


function User(data) {
    // Copy data to this
    _.extend(this, data);

    _.bindAll(this);
}

User.prototype.isValid = function() {
    var valid = _.all(
        _.values(
            this.info()
        )
    );
    return valid;
};

User.prototype.info = function() {
    return _.pick(this,
        'userId',
        'token',
        'name',
        'email',
        'image'
    );
};

User.prototype.publicInfo = function() {
    return _.omit(this.info(), 'token');
};

// Exports
exports.User = User;