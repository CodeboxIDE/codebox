// Requires
var _ = require('underscore');

var wireFriendly = require('../utils').wireFriendly;
var timestamp = require('../utils').timestamp;


function setup(options, imports, register) {
    // Import
    var events = imports.events;
    var workspace = imports.workspace;
    var hooks = imports.hooks;
    var logger = imports.logger.namespace("webhook");

    var url = options.url; // URL to post to
    var timeout = Number(options.timeout || 120) * 1e3; // 2mn

    // Exit and don't setup webhook
    if(!url) {
        logger.error("requires a webhook url (WEBHOOK_URL) to work");
        return register(null, {});
    }

    // A queue we push all our events to
    var eventQueue = [];

    // Send events and empty queue
    var sendEvents = _.debounce(function sendEvents() {
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
            data: wireFriendly(data),

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
