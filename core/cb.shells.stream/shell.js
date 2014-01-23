// Requires
var Q = require('q');
var _ = require('underscore');
var shux = require('shux');

var qnode = require('../utils').qnode;

var es = require('event-stream');


function Shell(manager, shellId, ptyStream, opts) {
    // External stuff
    this.shellId = shellId;
    this.manager = manager;

    // Streams
    this.pty = ptyStream;

    // PTY options
    this.opts = opts || {};

    // PTY
    this.term = null;

    _.bindAll(this);
}

Shell.prototype._getShell = function() {
    var id = this.shellId;
    var manager = this.manager;

    // Don't reopen shell if already exists
    if(manager.shells[id]) {
        return Q(manager.attach(id));
    }
    return manager.createShell(id, this.opts);
};

Shell.prototype.init = function() {
    return [
        this._initPty
    ].reduce(Q.when, Q())
    .fail(function(error) {
        console.error(error);
        console.error(error.stack);
        process.exit();
    });
};

Shell.prototype._initPty = function() {
    var that = this;
    var pty = this.pty;

    // Term object
    return this._getShell()
    .then(function(shell) {
        // Set term to shell
        this.term = shell;

        // Pipe
        pty.pipe(shell).pipe(pty);
    });
};

// Public RPC methods
Shell.prototype.rpcObj = function() {
    return {
        'resize': qnode(this.resize),
        'close': qnode(this.close)
    };
};

// RPC methods
Shell.prototype.resize = function(width, height) {
    return this.term.resize(width, height);
};


Shell.prototype.close = function() {
    this.term.kill();
};


// Exports
exports.Shell = Shell;
