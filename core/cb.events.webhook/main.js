// Requires
var _ = require('lodash');
var timestamp = require('../utils').timestamp;


function setup(options, imports, register) {
    // Import
    var events = imports.events;
    var workspace = imports.workspace;
    var hooks = imports.hooks;
    var logger = imports.logger.namespace("reporting");
    
    var timeout = Number(options.timeout || 180) * 1e3; // 3mn

    logger.log("events reporting with timeout of", timeout, "ms")

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

    // Construct
    events.onAny(function(data) {
        // Queue new event
        queueEvent({
            // Type of event
            event: this.event,

            // Data of event
            data: data,

            // Workspace ID
            workspaceId: workspace.id,

            // Timestamp of event
            timestamp: timestamp()
        });

        // Send events
        sendEvents();
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
