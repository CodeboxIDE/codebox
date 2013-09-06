// Requires
var path = require('path');


function setup(options, imports, register) {


    register(null, {
        "workspace": {
            root: path.resolve(__dirname, '..', '..'),
            mtime: null
        }
    });
}

// Exports
module.exports = setup;