// Requires
var path = require('path');

var Workspace = require('./workspace').Workspace;


function setup(options, imports, register) {
    // Imports
    var events = imports.events;

    // Root dir
    var rootPath = options.root || path.resolve(__dirname, '..', '..');

    var workspace = new Workspace(rootPath, events);

    register(null, {
        "workspace": workspace
    });
}

// Exports
module.exports = setup;