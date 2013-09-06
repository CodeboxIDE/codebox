// Requires
var wireFriendly = require('../utils').wireFriendly;


function setup(options, imports, register) {
    // Import
    var events = imports.events;

    // Construct
    events.onAny(function(data) {
        console.info('[events]', this.event, ':', wireFriendly(data));
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
