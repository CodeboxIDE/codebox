    // Requires
var Q = require('q');
var _ = require('lodash');
var uuid = require('uuid');
var crc = require('crc');

var User = require('./user').User;


function Workspace(options, events) {
    options = _.defaults({}, options, {
        'id': null,
        'secret': uuid.v4(),
        'name': 'codebox',
        'public': true,
        'root': "./",
        'maxUsers': 100
    });

    // Public ID of workspace (ok to share)
    this.id = options.id || crc.hex32(crc.crc32(options.root));

    // Secret token used for securing cookies, sessions ...
    this.secret = options.secret;

    // Name
    this.name = options.name;

    // Public
    this.public = options.public;

    // Base folder
    this.root = options.root;

    // Mapping of users
    this._users = {};
    this.maxUsers = options.maxUsers;

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
        return Q.reject(new Error("Could not add user, because user object is not valid (missing data)"));
    }

    // Limit count
    if (_.size(this._users) >= this.maxUsers) {
        return Q.reject(new Error("Could not add user, because there are already too many users (limit="+this.maxUsers+")"));
    }

    // Add to map
    this._users[user.userId] = user;

    // Events
    this.events.emit('users.add', user.info());

    return this.getUser(user.userId);
};

Workspace.prototype.removeUser = function(user) {
    if(!this._hasUser(user)) {
        return Q.reject(new Error("Could not remove user with id="+user.userId+" because, no such user exists"));
    }

    var rUserInfo = user.info();


    // Cleanup
    delete this._users[user.userId];

    // Events
    this.events.emit('users.remove', rUserInfo);

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
        that.events.emit('users.update', user.info());

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
        return Q.reject(new Error("User with id="+userId+" does not exist"));
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
