// Requires
var Q = require('q');


function setup(options, imports, register) {
    // Import
    var server = imports.server.http;
    var port = imports.server.port;
    var hostname = imports.server.hostname;
    var watch = imports.watch;
    var workspace = imports.workspace;
    var logger = imports.logger.namespace("codebox");

    var d = Q.defer();

    // Start server
    server.listen(port, hostname);

    // Success/failure
    server.on('listening', d.resolve);
    server.on('error', d.reject);


    return d.promise
    .then(function() {
        return watch.init(workspace.root);
    });
}

// Exports
module.exports = setup;
