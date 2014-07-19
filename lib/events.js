var EventEmitter2 = require('eventemitter2').EventEmitter2;
var logger = require('./utils/logger')("events");
var socket = require('./socket');

var events = new EventEmitter2({
    delimiter: ":",
    wildcart: true
});

var init = function(config) {
    socket.service("events", function(conn) {
        var handler = function(data) {
            conn.send("event", {
                "event": this.event,
                "data": data
            });
        };

        events.on("*", handler);

        // Disconnect cleanly
        conn.on('close', function() {
            events.off("*", handler);
        });
    });

    logger.log("events are ready");
};


module.exports = {
    init: init,
    emit: events.emit.bind(events)
};
