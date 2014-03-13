

function setup(options, imports, register) {
    // Import
    var events = imports.events;
    var io = imports.socket_io.io;

    // Send events to user
    io.of('/events').on('connection', function(socket) {
        // Send to client
        var handler = function(data) {
            socket.emit("event", {
                "event": this.event, 
                "data": data
            });
        };

        // Clean up on disconnect
        var cleanup = function() {
            events.offAny(handler);
        };

        // Construct
        events.onAny(handler);

        // Disconnect cleanly
        socket.on('disconnect', cleanup);

    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
