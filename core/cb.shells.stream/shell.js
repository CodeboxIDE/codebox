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
    this.opts = opts;

    // PTY
    this.term = null;

    _.bindAll(this);
}

Shell.prototype._getShell = function() {
    var id = this.shellId;
    var manager = this.manager;

    var args = _.extend({
        command: 'bash'
     }, this.opts);

    // Don't reopen shell if already exists
    if(manager.shells[id]) {
        return manager.attach(id);
    }
    return manager.createShell(id, args);
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
    var pty = this.pty;

    // Term object
    var t = this.term = this._getShell();

    // Pipe
    pty.pipe(t).pipe(pty);

    // End
    //t.on('end', pty.end.bind(pty));

    return Q('pty');
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
