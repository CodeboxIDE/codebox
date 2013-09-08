// Requires
var path = require('path');

var Workspace = require('./workspace').Workspace;


function setup(options, imports, register) {
    var workspace = new Workspace(path.resolve(__dirname, '..', '..'));

    register(null, {
        "workspace": workspace
    });
}

// Exports
module.exports = setup;