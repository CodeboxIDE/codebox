// Requires
var Q = require('q');
var _ = require('lodash');

var ss = require('socket.io-stream');
var es = require('event-stream');

var Shell = require('./shell').Shell;


function ShellSocketManager(manager) {
    this.manager = manager;

    _.bindAll(this);
}

ShellSocketManager.prototype.handleStream = function(stream, shellId, opts) {
    // Input data
    var manager = this.manager;

    // Build new shell
    var shell = new Shell(
        manager,
        shellId,
        stream,
        opts
    );

    // Initialize
    return shell.init();
};


function setup(options, imports, register) {
    // Import
    var shells = imports.shells;
    var io = imports.socket_io.io;
    var events = imports.events;
    var shells_rpc = imports.shells_rpc;

    var socketManager = new ShellSocketManager(shells);

    events.on('shell.spawn', function(data) {
        return shells.shells[data.shellId].ps.pause();
    });

    events.on('shell.open', function(data) {
        shells.shells[data.shellId].ps.resume();
    });

    // Construct
    io.of('/stream/shells').on('connection', function(socket) {
        ss(socket).on('shell.open', function(stream, data) {
            // Default options
            data.opts = _.defaults(data.opts, {
                'arguments': []
            });

            // Connect stream to socket.io
            // then resume shell's stream
            return socketManager.handleStream(stream, data.shellId, data.opts)
            .then(function(shell) {
                // Stream is now hooked up
                events.emit('shell.open', {
                    'shellId': data.shellId
                });
            });
        });

        socket.on('shell.destroy', function (data) {
            shells_rpc.destroy(data)
            .then(function() {
                events.emit('shell.destroy', data);
            });
        });

        socket.on('shell.resize', function(data) {
            shells_rpc.resize(data)
            .then(function() {
                events.emit('shell.resize', data);
            });
        });
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
