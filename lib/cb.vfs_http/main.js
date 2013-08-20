// Requires
var vfsHttp = require('vfs-http-adapter');


function setup(options, imports, register) {
    var vfs = imports.vfs;
    var app = imports.server.app;

    // Setup HTTP vfs
    app.use(vfsHttp("/vfs/", vfs));

    register(null, {});
}

// Exports
module.exports = setup;