// Requires
var vfsLocal = require('vfs-local');

function setup(options, imports, register) {
    var workspace = imports.workspace;

    // Initialize local vfs
    var vfs = vfsLocal({
        'root': workspace.root,
        // -rwxr-xr-x
        'umask': 0755
    });

    register(null, {
        "vfs": vfs
    });
}

// Exports
module.exports = setup;