// Requires
var Q = require('q');
var _ = require('lodash');

var util = require('util');
var EventEmitter = require('events').EventEmitter;

// Local requires
var Cursor = require('./cursor').Cursor;
var Selection = require('./selection').Selection;

// A user in a specific anvironment
function User(socket, userId, token, service) {
    User.super_.call(this);

    _.bindAll(this);

    // User info
    this.socket = socket;
    this.token = token;
    this.userId = userId;
    this.service = service;

    // Cursor data
    this.cursor = new Cursor();
    this.selection = new Selection();

    // Meta
    this.authCache = {};

    this.socket.on('disconnect', this.onClose);
}
util.inherits(User, EventEmitter);

User.prototype.key = function() {
    return this.userId; //[this.userId, this.socket.id].join(':');
};

User.prototype.open = function(path, perm) {
    perm = perm || 'w';
    var d = Q.defer();

    var cacheKey = perm + ':' + perm;

    // Should authenticate
    var that = this;
    if(cacheKey in this.authCache) {
        d.resolve(this.authCache[cacheKey]);
    } else {
        Q.nfbind(this.service.invoke)('open', path, this.userId, this.token)
        .then(function(authorized) {
            that.authCache[cacheKey] = authorized;
            return d.resolve(authorized);
        })
        .fail(function(err) {
            d.resolve(false);
        });
    }

    return d.promise;
};

User.prototype.move = function(x, y) {
    this.cursor = new Cursor(x, y);
};

User.prototype.select = function(sx, sy, ex, ey) {
    this.selection = new Selection(sx, sy, ex, ey);
};

User.prototype.info = function(first_argument) {
    return _.pick(this,
        'userId',
        'cursor',
        'selection'
    );
};

User.prototype.close = function(path) {
    return Q.nfbind(this.service.invoke)('close', path, this.userId);
};

User.prototype.onClose = function() {
    return this.emit('exit', this);
};

var createUser = Q.fbind(function (socket, userId, token, service) {
    return new User(socket, userId, token, service);
});


// Exports
exports.User = User;
exports.createUser = createUser;
