// Requires
var vfsLocal = require('vfs-local');

function setup(options, imports, register) {
    var workspace = imports.workspace;

    // Initialize local vfs
    var vfs = vfsLocal({
        root: workspace.root
    });

    register(null, {
        "vfs": vfs
    });
}

// Exports
module.exports = setup;