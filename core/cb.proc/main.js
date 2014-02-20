// Requires
var _ = require('lodash');

var http = require('./http').list;

function setup(options, imports, register) {
    var serverPort = imports.server.port;

    // Function to filter out Codebox's current port
    var portFilter = function portFilter(res) {
        return res.port != serverPort;
    };

    // Listing function adapted for current running instance
    var _http = function _http() {
        return http(options.urlPattern)
        .then(function(results) {
            return results.filter(portFilter);
        });
    };

    register(null, {
        'proc': {
            // List using the given urlPattern
            'http': _http
        }
    });
}

// Exports
module.exports = setup;