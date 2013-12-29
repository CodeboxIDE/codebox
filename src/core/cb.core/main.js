// Requires
var path = require('path');

var Workspace = require('./workspace').Workspace;


function setup(options, imports, register) {
    // Imports
    var events = imports.events;

    // Options: root dir, title
    var rootPath = options.root || path.resolve(__dirname, '..', '..');

    var workspace = new Workspace({
        'id': options.id,
        'root': rootPath,
        'name': options.title,
        'public': options.public,
        'maxUsers': options.maxUsers
    }, events);

    register(null, {
        "workspace": workspace
    });
}

// Exports
module.exports = setup;