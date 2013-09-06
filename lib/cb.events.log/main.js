// Requires
var wireFriendly = require('../utils').wireFriendly;
var timestamp = require('../utils').timestamp;



function setup(options, imports, register) {
    // Import
    var events = imports.events;
    var workspace = imports.workspace;

    // Construct
    events.onAny(function(data) {
        // Update mtime
        workspace.mtime = timestamp();

        // Log events to console
        console.info('[events]', this.event, ':', wireFriendly(data));
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
