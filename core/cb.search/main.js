var _ = require('lodash');

var filesSearch = require("./files");
var codeSearch = require("./code");

function setup(options, imports, register) {
    // Import
    var vfs = imports.vfs;
    var workspace = imports.workspace;

    // Register
    register(null, {
        "search": {
            files: _.partial(filesSearch, workspace.root),
            code: _.partial(codeSearch, workspace.root)
        }
    });
}

// Exports
module.exports = setup;
