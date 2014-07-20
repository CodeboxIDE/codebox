var _ = require('lodash');
var crc = require('crc');

// Base structure for a configuration
module.exports = function(options) {
    options = _.defaults(options, {
        // Port for running the webserver
        'port': 3000,

        // Root folder
        'root': process.cwd(),

        // Workspace id
        'id': null,

        // Secret identifier for the workspace
        'secret': null,

        // Events reporting
        'reporting': {
            'timeout': 180 * 1e3
        }
    });

    // Unique id for workspace
    options.id = options.id ||  crc.hex32(crc.crc32(options.root))

    return options;
};
