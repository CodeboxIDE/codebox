// Requires
var http = require('./http').list;

function setup(options, imports, register) {
    register(null, {
        'proc': {
            'http': http
        }
    });
}

// Exports
module.exports = setup;