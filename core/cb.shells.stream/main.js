// Requires
var Q = require('q');
var _ = require('lodash');



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
        var options = null;

        logger.log("new socket connected");

        socket.on('shell.open', function(data) {
            options = data;
            logger.log("open shell ", options);

            // Default options
            options.opts = _.defaults(options.opts, {
                'arguments': []
            });

            return getShell(options)
            .then(function(_shell) {
                // Increment number of socket connected to this shell
                shells.shells[data.shellId].nSockets = (shells.shells[data.shellId].nSockets || 0) + 1;

                shell = _shell;

                shell.on('data', function(data) {
                    socket.emit("shell.output", data.toString("utf8"));
                });

                shell.on('end', function() {
                    socket.disconnect();
                });

                // Stream is now hooked up
                events.emit('shell.open', {
                    'shellId': data.shellId
                });
            });
        });

        socket.on("disconnect", function() {
            logger.log("socket disconnected");

            if (!shell || !shells.shells[options.shellId]) return;
            
            if (shells.shells[options.shellId].nSockets > 1) {
                logger.log("-> don't close multi-users terminal ", options.shellId);
                shells.shells[options.shellId].nSockets = shells.shells[options.shellId].nSockets - 1;
            } else {
                shells_rpc.destroy(options);
            }
        });

        socket.on('shell.input', function(data) {
            if (!shell) return;
            shell.write(data);
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
