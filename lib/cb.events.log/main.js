// Requires


function setup(options, imports, register) {
    // Import
    var events = imports.events;

    // Construct
    events.onAny(function(data) {
        console.info('[events]', this.event, ':', data);
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
