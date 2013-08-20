// Requires
var _ = require('underscore');
var Manager = require('codefire/lib/manager').Manager;


function setup(options, imports, register) {
    // Imports
    var io = imports.socket_io.io;
    var service = imports.files_service.service;

    // Construct
    var manager = new Manager({
        service: service
    });

    // Hook up to server
    io.on('connection', function(socket) {
        var handler = _.partial(manager.handle, socket);

        // Send to CodeFire handler
        socket.on('message', handler);
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
