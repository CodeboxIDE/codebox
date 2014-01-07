// Requires
var FilesService = require('./service').FilesService;


// Setup
function setup(options, imports, register) {
    // Import
    var vfs = imports.vfs;
    var events = imports.events;

    // Construct
    var service = new FilesService(vfs, events);

    // Register
    register(null, {
        "files_service": {
            "service": service
        }
    });
}

// Exports
module.exports = setup;
