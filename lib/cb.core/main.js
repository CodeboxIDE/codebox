// Requires
var path = require('path');


function setup(options, imports, register) {


    register(null, {
        "workspace": {
            root: path.resolve(__dirname, '..', '..')
        }
    });
}

// Exports
module.exports = setup;