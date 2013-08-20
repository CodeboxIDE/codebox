// Requires


function setup(options, imports, register) {
    // Import
    var server = imports.server.http;

    // Start server
    server.listen(8000);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
