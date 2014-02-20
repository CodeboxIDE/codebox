// Requires
var Q = require('q');
var _ = require('lodash');

var Document = require('./models/document').Document;

/*
 * Environment represents a synchronized environment
 * between multiple users
 */

function Environment(envId, creator, service) {
    _.bindAll(this);

    // Represents a synchronized file
    this.users = {};
    this.envId = envId;
    this.locked = false;
    this.modified = false;
    this.service = service;

    this.doc = new Document(null, creator.userId, this.service, this.transferPatch);
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

    // Set member (prototypal inheritance)
    function member() {}
    member.prototype = user;
    this.users[user.key()] = new member();

    user.on('exit', this.userExit);
    this.pingOthers(user);
    return Q(true);
};

Environment.prototype.userExit = function(user) {
    if(!this.hasUser(user)) {
        return Q(true);
    }

    // Remove user from environment
    this.removeUser(user);

    var base = Q();
    if (this.doc.path != null) {
        // Close the file
        base = user.close(this.doc.path)
    }

    var that = this;

    // then notify other users of departure
    return base.then(function() {
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
    return this.notifyAll("modified", {
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
        'environment':  this.envId
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
        state: this.modified,
        path: this.doc.path
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

Environment.prototype.transferPatch = function(user, patch, hashBefore, hashAfter) {
    this.notifyOthers(user, 'patch', {
        'patch': patch,
        'hashs': {
            'before': hashBefore,
            'after': hashAfter
        }
    });
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
    var that = this;

    if (payload.path) {
        this.doc.setPath(payload.path);
    }

    // Synchronize content
    this.doc.save().then(function() {
        that.modifiedState(false);
        that.syncAll();
    });
};

Environment.prototype.load = function(user, payload) {
    var that = this;

    if (this.doc.path == payload.path) {
        return this.sync(user, payload);
    } 

    user.open(payload.path).then(function(authorized) {
        if(!authorized) {
            throw new Error("User was not allowed to open file");
        }

        that.doc.setPath(payload.path);
        return that.doc.load();
    }).then(function() {
        that.syncAll();
    });
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
        user,
        payload.patch,
        payload.hashs.before,
        payload.hashs.after
    );

    if (patched === undefined) {
        return;
    }

    // Failed patching
    if(patched == null) {
        return this.syncAll();
    }
    this.modifiedState(patched);
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
