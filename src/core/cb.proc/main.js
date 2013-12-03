// Requires
var _ = require('underscore');

var http = require('./http').list;

function setup(options, imports, register) {


    register(null, {
        'proc': {
            // List using the given urlPattern
            'http': _.partial(http, options.urlPattern)
        }
    });
}

// Exports
module.exports = setup;