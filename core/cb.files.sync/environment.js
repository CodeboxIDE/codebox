// Requires
var Q = require('q');
var _ = require('underscore');

var Document = require('./models/document').Document;

/*
 * Environment represents a synchronized environment
 * between multiple users
 */

function Environment(path, creator, service) {
    _.bindAll(this);

    // Represents a synchronized file
    this.users = {};
    this.path = path;
    this.locked = false;
    this.modified = false;
    this.service = service;

    this.doc = new Document(this.path, creator.userId, this.service);
}

Environment.prototype.setup = function() {
    var that = this;
    return this.loadCache().then(function() {
        return that;
    });
};

Environment.prototype.hasUser = function(user) {
    return user.key() in this.users;
};

Environment.prototype.addUser = function(user) {
    if(this.hasUser(user)) {
        return Q(true);
    }

    var that = this;
    return user.open(this.path)
    .then(function(authorized) {
        if(!authorized) {
            throw new Error("User was not allowed to open file");
        }

        // Set member (prototypal inheritance)
        function member() {}
        member.prototype = user;
        that.users[user.key()] = new member();

        user.on('exit', that.userExit);

        return authorized;
    });
};

Environment.prototype.userExit = function(user) {
    if(!this.hasUser(user)) {
        return Q(true);
    }

    var that = this;

    // Remove user from environment
    this.removeUser(user);

    // Close the file
    // then notify other users of departure
    return user.close(this.path)
    .then(function() {
        return that.pingOthers(user);
    });

};

Environment.prototype.removeUser = function(user) {
    delete this.users[user.key()];
};

Environment.prototype.getUser = function(user) {
    return this.users[user.key()];
};

Environment.prototype.modifiedState = function(state) {
    if (this.modified == state) return;
    this.modified = state;
    this.notifyAll("modified", {
        'state': this.modified
    });
};

Environment.prototype.usersInfo = function() {
    // Get infornmation on every use in the environment
    return _.map(this.users, function(user) {
        return user.info();
    });
};

Environment.prototype.updateCache = _.debounce(function(data) {
    // Only write to cache every 60s max
    return this.doc.update();
}, 60 * 1e3);

Environment.prototype.loadCache = function() {
    return this.doc.load();
};

Environment.prototype._notifyUser = function(user, action, data) {
    var metaInfo = {
        'path':  this.path
    };

    // Optionnal action
    if(action) metaInfo.action = action;

    // Add meta data and remove token (if present)
    var finalData = _.omit(
        _.extend(metaInfo, data),
        'token'
    );

    return user.socket.json.send(finalData);
};

Environment.prototype.notifyAll = function(action, data) {
    var users = _.values(this.users);
    return this.notify(users, action, data);
};

Environment.prototype.notifyOthers = function(user, action, data) {
    // Filter out itself
    var users = _.values(
        _.omit(this.users, user.key())
    );
    return this.notify(users, action, data);
};

Environment.prototype.notify = function(users, action, data) {
    if(!_.isArray(users)) {
        users = [users];
    }

    var that = this;
    _.each(
        users,
        function(user) {
            return that._notifyUser(user, action, data);
        }
    );
};

/*
 * Utility functions
 */
Environment.prototype.getSyncData = function() {
    return {
        content: this.doc.getContent(),
        participants: this.usersInfo(),
        state: this.modified
    };
};

/*
 * Internal actions
 */

Environment.prototype.syncAll = function() {
    return this.notifyAll('sync',
        this.getSyncData()
    );
};

Environment.prototype.pingOthers = function(user) {
    // List all current users with their respective info
    return this.notifyOthers(user, 'participants',
        {
            participants: this.usersInfo()
        }
    );
};

/*
 * Actions
 */

Environment.prototype.sync = function(user, payload) {
    // Synchronize content
    return this.notify(user, 'sync',
        this.getSyncData()
    );
};

Environment.prototype.save = function(user, payload) {
    // Synchronize content
    this.doc.save();
    return this.modifiedState(false);
};

Environment.prototype.ping = function(user, payload) {
    // List all current users with their respective info
    return this.notify(user, 'participants',
        {
            participants: this.usersInfo()
        }
    );
};

Environment.prototype.selectCursor = function(user, payload) {
    var member = this.getUser(user);
    member.select(
        payload.start.x,
        payload.start.y,
        payload.end.x,
        payload.end.y
    );
    return this.notifyOthers(user, null, payload);
};

Environment.prototype.moveCursor = function(user, payload) {
    var member = this.getUser(user);
    member.move(
        payload.cursor.x,
        payload.cursor.y
    );
    return this.notifyOthers(user, null, payload);
};

Environment.prototype.patch = function(user, payload) {
    var patched = this.doc.patch(
        payload.patch,
        payload.hashs.before,
        payload.hashs.after
    );

    // Failed patching
    if(!patched) {
        return this.syncAll();
    }

    this.modifiedState(true);

    return this.notifyOthers(user, null, payload);
};

Environment.prototype.close = function(user, payload) {
    return this.userExit(user);
};

function createEnvironment(path, user, service) {
    var env = new Environment(path, user, service);
    return env.setup();
}

// Exports
exports.Environment = Environment;
exports.createEnvironment = createEnvironment;
