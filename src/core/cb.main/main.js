function setup(options, imports, register) {
    // Import
    var server = imports.server.http;
    var port = imports.server.port;
    var watch = imports.watch;
    var workspace = imports.workspace;
    var logger = imports.logger.namespace("codebox");

    // Start server
    server.listen(port);

    server.on('listening', function() {
        logger.log("Server is listening on ", port);
        watch.init(workspace.root)
        .then(function() {
            logger.log("Started Watch");
        })
        .fail(function(err) {
            logger.error("Failed to start Watch because of:");
            logger.exception(err, false);
        }).fin(function() {
            // Register
            register(null, {});
        });
    })
}

// Exports
module.exports = setup;
