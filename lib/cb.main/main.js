// Requires


function setup(options, imports, register) {
    // Import
    var server = imports.server.http;
    var watch = imports.watch;
    var workspace = imports.workspace;

    // Start server
    server.listen(8000);

    server.on('listening', function() {
        watch.init(workspace.root)
        .then(function() {
            console.log("Started Watch :)");
        })
        .fail(function(err) {
            console.error("Failed to start Watch because of ", err, "exiting !!!");
            process.exit(-1);
        });
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
