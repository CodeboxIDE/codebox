// Requires
var _ = require('lodash');

var Gittle = require('gittle');


function setup(options, imports, register) {
    // Import
    var workspace = imports.workspace;

    // Construct
    var repo = new Gittle(workspace.root);

    // Register
    register(null, {
        "git": {
            repo: repo,
        }
    });
}

// Exports
module.exports = setup;
