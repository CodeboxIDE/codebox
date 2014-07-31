var Q = require('q');
var _ = require('lodash');

var logger = require('./utils/logger')("users");
var events = require('./events');
var hooks = require('./hooks');

var users = {};

var infosUser = function(userId) {
    userId = _.isString(userId)? userId : userId.id;
    if (!users[userId]) return Q.reject(new Error("User doesn't exists"));

    return Q(_.omit(users[userId], "token"));
};

var getUser = function(userId) {
    return users[userId];
};

var listUsers = function() {
    return _.map(users, function(user) {
        return _.omit(user, "token")
    });
};

var activeUser = function(userId) {
    userId = _.isString(userId)? userId : userId.id;
    if (!users[userId]) return Q.reject(new Error("User doesn't exists"));

    users[userId].mtime = Date.now();

    return infosUser(userId);
};

var auth = function(email, token, req) {
    return hooks.use("users.auth", {
        'email': email,
        'token': token
    })
    .then(function(user) {
        users[user.id] = user;

        return activeUser(user);
    })
    .then(function(user) {
        events.emit("users:add", user);

        if (req) req.session.userId = user.id;
        return user;
    });
};

var init = function(options) {
    logger.log("init users");
};

module.exports = {
    init: init,
    auth: auth,
    active: activeUser,
    infos: infosUser,
    list: listUsers,
    get: getUser
};
