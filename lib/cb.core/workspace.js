// Requires
var Q = require('q');
var _ = require('underscore');
var uuid = require('uuid');

var User = require('./user').User;

var qfail = require('../utils').qfail;


function Workspace(root, id) {
    // Public ID of workspace (ok to share)
    this.id = id || uuid.v4();

    // Secret token used for securing cookies, sessions ...
    this.secret = uuid.v4();

    // Base folder
    this.root = root;

    // Mapping of directories
    this._users = {};

    // Last modification
    this.mtime = null;

    _.bindAll(this);
}

Workspace.prototype._hasUser = function(userId) {
    return _.has(this._users, userId);
};

Workspace.prototype.hasUser = function(userId) {
    return Q(this._hasUser(userId));
};

Workspace.prototype.addUser = function(user) {
    // Already stored
    if(this._hasUser(user.userId)) {
        return this.getUser(user.userId);
    }

    if(!user.isValid()) {
        return qfail(new Error("Could not add user, because user object is not valid (missing data)"));
    }

    // Add to map
    this._users[user.userId] = user;

    return this.getUser(user.userId);
};

// Try to authenticate user with this data
// fail if not valid
// or if user exists
// fail if tokens don't match
Workspace.prototype.authUser = function(userData) {
    // User already exists
    if(this._hasUser(userData.userId)) {
        return this.getUser(userData.userId)
        .then(function(user) {
            if(user.token != userData.token) {
                return qfail;
            }
            return Q(user);
        });
    }
    // Add new user
    return this.addUser(new User(userData));
};

Workspace.prototype.getUser = function(userId) {
    if(!this._hasUser(userId)) {
        return qfail(new Error("User with id="+userId+" does not exist"));
    }
    return Q(this._users[userId]);
};

Workspace.prototype.users = function() {
    return Q(_.values(this._users));
};

Workspace.prototype.userIds = function() {
    return Q(_.keys(this._users));
};

Workspace.prototype.userCount = function() {
    return _.keys(this._users).length;
};

// Exports
exports.Workspace = Workspace;
