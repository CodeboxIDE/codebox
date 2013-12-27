// Requires
var _ = require('underscore');

var shux = require('shux');

function setup(options, imports, register) {
    var workspace = imports.workspace;

    // Construct
    var manager = shux();
    var oldCreateShell = manager.createShell.bind(manager);

    // Monkey patch createShell
    manager.createShell = function(id, opts) {
        return oldCreateShell(id, _.defaults(opts || {}, {
            cwd: workspace.root
        }));
    };

    // Register
    register(null, {
        "shells": manager
    });
}

// Exports
module.exports = setup;