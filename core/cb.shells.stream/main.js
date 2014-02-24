// Requires
var Q = require('q');
var _ = require('lodash');
var utils = require('../utils');


function setup(options, imports, register) {
    // Import
    var logger = imports.logger.namespace("shells.stream");
    var shells = imports.shells;
    var io = imports.socket_io.io;
    var events = imports.events;
    var shells_rpc = imports.shells_rpc;

    var getShell = function(data) {
        if(shells.shells[data.shellId]) {
            return Q(shells.attach(data.shellId));
        }
        return shells.createShell(data.shellId, data.opts)
    };

    events.on('shell.spawn', function(data) {
        return shells.shells[data.shellId].ps.pause();
    });

    events.on('shell.open', function(data) {
        shells.shells[data.shellId].ps.resume();
    });

    // Construct
    io.of('/shells').on('connection', function(socket) {
        var shell = null;
        var shellOptions = null;

        logger.log("new socket connected");


        var handleShellOutput = function(data) {
            socket.emit("shell.output", utils.btoa(data.toString("utf8")));
        };


        // Open the shell
        socket.on('shell.open', function(data) {
            shellOptions = data;
            logger.log("open shell ", shellOptions);

            // Default options
            shellOptions.opts = _.defaults(shellOptions.opts, {
                'arguments': []
            });

            return getShell(shellOptions)
            .then(function(_shell) {
                // Increment number of socket connected to this shell
                shells.shells[data.shellId].nSockets = (shells.shells[data.shellId].nSockets || 0) + 1;

                shell = _shell;

                // Bind events
                shell.on('data', handleShellOutput);
                shell.once('end', function() {
                    socket.disconnect();
                });

                // Stream is now hooked up
                events.emit('shell.open', {
                    'shellId': data.shellId
                });
            });
        });

        // Participant left
        socket.on("disconnect", function() {
            logger.log("socket disconnected");

            // Shell still exists
            if (!shell || !shells.shells[shellOptions.shellId]) return;

            // Unbind events
            shell.removeListener('data', handleShellOutput);

            if (shells.shells[shellOptions.shellId].nSockets > 1) {
                logger.log("-> don't close multi-users terminal ", shellOptions.shellId);
                shells.shells[shellOptions.shellId].nSockets = shells.shells[shellOptions.shellId].nSockets - 1;
            } else {
                shells_rpc.destroy(shellOptions);
            }
        });

        // Write to the stdin
        socket.on('shell.input', function(data) {
            if (!shell) return;

            shell.write(utils.atob(data));
        });

        // Destroy the shell (force)
        socket.on('shell.destroy', function () {
            if (!shell) return;

            shells_rpc.destroy(shellOptions);
        });

        // Resize the terminal
        socket.on('shell.resize', function(data) {
            if (!shell) return;

            data.shellId = shellOptions.shellId;

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
