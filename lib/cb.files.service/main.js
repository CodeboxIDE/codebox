// Requires
var FilesService = require('./service').FilesService;


// Setup
function setup(options, imports, register) {
    // Import
    var vfs = imports.vfs;

    // Construct
    var service = new FilesService(vfs);

    // Register
    register(null, {
        "files_service": {
            "service": service
        }
    });
}

// Exports
module.exports = setup;
