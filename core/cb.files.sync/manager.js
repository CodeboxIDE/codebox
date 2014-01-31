// Requires
var Q = require('q');
var _ = require('lodash');

var v = require('./validators');

var createUser = require('./models/user').createUser;
var createEnvironment = require('./environment').createEnvironment;

var actions = {
    "sync": "sync",
    "save": "save",
    "load": "load",
    "ping": "ping",
    "close": "close",
    "patch": "patch",
    "cursor": "moveCursor",
    "select": "selectCursor"
};

function Manager(service) {
    _.bindAll(this);

    // Service that handles all
    this.service = service;

    this.users = {};
    this.environments = {};
}

Manager.prototype.userKey = function(socket, userId, token) {
    return [userId, token, socket.id].join(':');
};

Manager.prototype.hasUser = function(socket, userId, token) {
    return this.userKey(socket, userId, token) in this.users;
};

Manager.prototype.createUser = function(socket, userId, token) {
    var that = this;
    return createUser(socket, userId, token, this.service).then(function(user) {
        var key = that.userKey(socket, userId, token);
        that.users[key] = user;
        user.once('exit', that.userExit);
        return user;
    });
};

Manager.prototype.userExit = function(user) {
    this.removeUser(user);
};

Manager.prototype.removeUser = function(user) {
    delete this.users[user.key()];
};

Manager.prototype._getUser = function(socket, userId, token) {
    return Q(this.users[this.userKey(socket, userId, token)]);
};

Manager.prototype.getUser = function(socket, userId, token) {
    if(!this.hasUser(socket, userId, token)) {
        return this.createUser(socket, userId, token);
    }
    return this._getUser(socket, userId, token);
};

Manager.prototype.hasEnvironment = function(path) {
    return path in this.environments;
};

Manager.prototype.createEnvironment = function(environmentId, user) {
    var that = this;
    return createEnvironment(environmentId, user, this.service).then(function(env) {
        that.environments[environmentId] = env;
        return env;
    });
};

Manager.prototype._getEnvironment = function(environmentId) {
    return Q(this.environments[environmentId]);
};

Manager.prototype.getEnvironment = function(environmentId, user) {
    if(!this.hasEnvironment(environmentId)) {
        return this.createEnvironment(environmentId, user);
    }
    return this._getEnvironment(environmentId);
};

Manager.prototype.handle = function(socket, data) {
    // Must be a valid request
    if(!v.base(data)) return;

    // Extract info
    var environmentId = data.environment;
    var token = data.token;
    var userId = data.from;

    var that = this;

    // Authentication and then load payload
    this.getUser(socket, userId, token)
    .then(function(user) {
        return that.getEnvironment(environmentId, user)
        .then(function(env) {
            // Do action
            return env.addUser(user).then(function() {
                return that.runPayload(user, env, data);
            });
        });
    })
    .fail(function(err) {
        console.log('Failing :', err);
        console.log('Stack :', err.stack);
    });
};

Manager.prototype.runPayload = function(user, env, payload) {
    var action = payload.action;

    var method = actions[action];
    if(!method) {
        throw new Error("Action does not exist");
    }

    var actor = env[method];
    var validator = v[method];

    if(!validator(payload)) {
        throw new Error("Payload is invalid");
    }

    return actor(user, payload);
};

// Exports
exports.Manager = Manager;