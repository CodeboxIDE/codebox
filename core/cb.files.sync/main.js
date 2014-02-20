// Requires
var _ = require('lodash');
var Manager = require('./manager').Manager;


function setup(options, imports, register) {
    // Imports
    var io = imports.socket_io.io;
    var service = imports.files_service.service;
    var logger = imports.logger.namespace("filesync")

    // Construct
    var manager = new Manager(service);

    // Hook up to server
    io.of('/filesync').on('connection', function(socket) {
        var handler = _.partial(manager.handle, socket);

        // Send to CodeFire handler
        socket.on('message', handler);
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
