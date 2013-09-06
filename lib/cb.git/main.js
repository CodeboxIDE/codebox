// Requires
var _ = require('underscore');

var gift = require('gift');


function setup(options, imports, register) {
    // Import
    var workspace = imports.workspace;

    // Construct
    var repo = gift(workspace.root);

    // Bind repo method to itself
    _.bindAll(repo);

    // Register
    register(null, {
        "git": {
            repo: repo,
        }
    });
}

// Exports
module.exports = setup;
