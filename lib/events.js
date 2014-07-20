var EventEmitter2 = require('eventemitter2').EventEmitter2;
var _ = require('lodash');

var logger = require('./utils/logger')("events");
var socket = require('./socket');
var timestamp = require('./utils/time').timestamp;
var hooks = require('./hooks');

var events = new EventEmitter2({
    delimiter: ":",
    wildcart: true
});

var init = function(config) {
    ///// Add socket service events
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
            events.off("*", handler);
        });
    });

    ///// Add events reportings

    // Interval to send events
    var timeout = Number(config.reporting.timeout || 180) * 1e3; // 3mn

    // A queue we push all our events to
    var eventQueue = [];

    // Send events and empty queue
    var sendEvents = _.debounce(function sendEvents() {
        logger.log("report", _.size(eventQueue), "events");

        // Hit hook
        hooks.use("events", eventQueue);

        // Empty queue
        eventQueue = [];
    }, timeout);

    var queueEvent = function queueEvent(eventData) {
        eventQueue.push(eventData);
    };

    events.onAny(function(data) {
        // Queue new event
        queueEvent({
            // Type of event
            event: this.event,

            // Data of event
            data: data,

            // Workspace ID
            workspaceId: config.id,

            // Timestamp of event
            timestamp: (Date.now()/1000)
        });

        // Send events
        sendEvents();
    });

    logger.log("events are ready");
};


module.exports = {
    init: init,
    emit: events.emit.bind(events)
};
