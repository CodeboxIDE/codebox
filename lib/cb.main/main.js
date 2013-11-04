function setup(options, imports, register) {
    // Import
    var server = imports.server.http;
    var watch = imports.watch;
    var workspace = imports.workspace;
    var logger = imports.logger.namespace("codebox");
    var port = 8000;

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
            logger.exception(err);
        });
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
