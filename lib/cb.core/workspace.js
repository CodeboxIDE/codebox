// Requires
var Q = require('q');
var _ = require('underscore');
var uuid = require('uuid');

var User = require('./user').User;

var qfail = require('../utils').qfail;


function Workspace(name, root, events, id) {
    // Public ID of workspace (ok to share)
    this.id = id || uuid.v4();

    // Secret token used for securing cookies, sessions ...
    this.secret = uuid.v4();

    // Name
    this.name = name || "project";

    // Base folder
    this.root = root;

    // Mapping of directories
    this._users = {};

    // Last modification
    this.mtime = null;

    // Events emitter
    this.events = events;

    // Users check interval
    this.usersInterval = setInterval(_.bind(this.checkUsers, this), 5*60*1000); // 5 minutes

    _.bindAll(this);
}

Workspace.prototype._hasUser = function(userId) {
    if (userId instanceof User) {
        userId = userId.userId;
    }
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

    // Events
    this.events.emit('users.add', user.userId);

    return this.getUser(user.userId);
};

Workspace.prototype.removeUser = function(user) {
    if(!this._hasUser(user)) {
        return qfail(new Error("Could not remove user with id="+user.userId+" because, no such user exists"));
    }

    var rUserId = user.userId;

    // Cleanup
    delete this._users[user.userId];

    // Events
    this.events.emit('users.remove', rUserId);

    // Return removed user
    return Q(user);
};

// Try to authenticate user with this data
// fail if not valid
// or if user exists
// fail if tokens don't match
Workspace.prototype.authUser = function(userData) {
    // User already exists
    var that = this;

    if(this._hasUser(userData.userId)) {
        return this.getUser(userData.userId)
        .then(function(user) {
            if(user.token != userData.token) {
                return that.updateUser(userData);
            }
            return Q(user);
        });
    }
    // Add new user
    return this.addUser(new User(userData));
};

Workspace.prototype.updateUser = function(userData) {
    var that = this;

    return this.getUser(userData.userId)
    .then(function(user) {
        _.extend(user, userData);
        that.events.emit('users.update', userData.userId);

        return user;
    });
};

Workspace.prototype.checkUsers = function() {
    var that = this;
    _.each(this._users, function(user) {
        if (!user.isActif()) {
            that.removeUser(user);
        }
    });
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
