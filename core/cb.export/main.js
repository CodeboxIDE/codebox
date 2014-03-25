var fstream = require('fstream'),
    tar = require('tar'),
    zlib = require('zlib');

function setup(options, imports, register) {
    // Import
    var server = imports.server;
    var logger = imports.logger.namespace("export");
    var workspace = imports.workspace;

    // Export as zip
    server.app.get("/export/targz", function(req, res) {
        res.header('Content-Type', 'application/octet-stream');
        res.header('Content-Disposition', 'attachment; filename="workspace.tar.gz"');
        res.header('Content-Encoding', 'gzip');

        fstream.Reader({ 'path' : workspace.root, 'type' : 'Directory' })
            .pipe(tar.Pack())
            .pipe(zlib.Gzip())
            .pipe(res);
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
