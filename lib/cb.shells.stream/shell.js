// Requires
var Q = require('Q');
var _ = require('underscore');

var dnode = require('dnode');
var qnode = require('../utils').qnode;

var es = require('event-stream');


function Shell(manager, shellId, rpcStream, ptyStream) {
    // External stuff
    this.shellId = shellId;
    this.manager = manager;

    // Streams
    this.rpc = rpcStream;
    this.pty = ptyStream;

    // RPC & PTY
    this.term = null;
    this.dnode = null;

    _.bindAll(this);
}

Shell.prototype._getShell = function() {
    var id = this.shellId;
    var manager = this.manager;

    // Don't reopen shell if already exists
    if(manager.shells[id]) {
        return manager.attach(id);
    }
    return manager.createShell(id);
};

Shell.prototype.init = function() {
    return [
        this._initPty,
        //this._initRpc
    ].reduce(Q.when, Q())
    .then(Q(this))
    .fail(function(error) {
        console.error(error);
        console.error(error.stack);
        process.exit();
    });
};

Shell.prototype._initRpc = function() {
    var rpc = this.rpc;

    // RPC object
    var d = this.dnode = dnode(this.rpcObj);

    // Pipe
    rpc.pipe(d).pipe(rpc);

    // End
    d.on('end', rpc.end.bind(rpc));

    return Q(true);
};

Shell.prototype._initPty = function() {
    var pty = this.pty;

    // Term object
    var t = this.term = this._getShell();

    // Pipe
    pty.pipe(t).pipe(pty);
    t.on('data', function(data) {
        console.log('data =', data);
        pty.write(data);
    });

    pty.on('data', function(data) {
        console.log('Got data !!!');
        pty.write('GOT DATA !!!');
    })

    // End
    t.on('end', pty.end.bind(pty));

    return Q(true);
};

// Public RPC methods
Shell.prototype.rpcObj = function() {
    return {
        resize: qnode(this.resize),
        close: qnode(this.close),
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
