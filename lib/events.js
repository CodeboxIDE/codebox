var events = require('events');

var logger = require('./utils/logger')("events");
var socket = require('./socket');

var events = new events.EventEmitter();

var init = function(config) {
    socket.service("events", function(conn) {
        var handler = function(data) {
            conn.send("event", {
                "event": this.event,
                "data": data
            });
        };

        events.onAny(handler);

        // Disconnect cleanly
        conn.on('close', function() {
            events.offAny(handler);
        });
    });

    logger.log("events are ready");
};


module.exports = {
    init: init,
    emit: events.emit.bind(events)
};
