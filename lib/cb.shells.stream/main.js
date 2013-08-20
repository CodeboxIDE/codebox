// Requires
var shoe = require('shoe');


function setup(options, imports, register) {
    // Import
    var shellManager = imports.shells.manager;
    var server = imports.server.http;

    // Construct
    var sock = shoe(function(stream) {

    });

    sock.install('/stream/shells', server);

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
