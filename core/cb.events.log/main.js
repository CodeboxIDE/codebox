// Requires
var timestamp = require('../utils').timestamp;

function setup(options, imports, register) {
    // Import
    var events = imports.events;
    var workspace = imports.workspace;
    var logger = imports.logger.namespace("events");

    // Construct
    events.onAny(function(data) {
        // Update mtime
        workspace.mtime = timestamp();

        // Log events to console
        logger.log(this.event, ':', data);
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
