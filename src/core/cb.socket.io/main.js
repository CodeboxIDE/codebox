// Requires
var socketio = require('socket.io');

function setup(options, imports, register) {
    var server = imports.server.http;


    var io = socketio.listen(server, {
        // Do not run a flash policy server
        // (requires root permissions)
        'flash policy port': -1,
        'destroy upgrade': false,
        'log level': 1,
    });

    register(null, {
        "socket_io": {
            "io": io
        }
    });
}

// Exports
module.exports = setup;
