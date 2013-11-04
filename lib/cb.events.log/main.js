// Requires
var wireFriendly = require('../utils').wireFriendly;
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
        logger.log(this.event, ':', wireFriendly(data));
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
