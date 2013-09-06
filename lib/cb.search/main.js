// Requires
var _ = require('underscore');

var search = require('./search').search;


function setup(options, imports, register) {
    // Import
    var vfs = imports.vfs;
    var workspace = imports.workspace;

    // Construct
    var filesSearch = _.partial(search, workspace.root, vfs);

    // Register
    register(null, {
        "search": {
            files: filesSearch
        }
    });
}

// Exports
module.exports = setup;
