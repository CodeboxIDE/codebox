var _ = require('lodash');
var crc = require('crc');
var path = require('path');

// Base structure for a configuration
module.exports = function(options) {
    options = _.merge(options, {
        // Port for running the webserver
        'port': process.env.PORT || 3000,

        // Root folder
        'root': process.cwd(),

        // Workspace id
        'id': null,

        // Secret identifier for the workspace
        'secret': null,

        // Events reporting
        'reporting': {
            'timeout': 180 * 1e3
        },

        // Authentication settings
        'auth': {
            'basic': true
        },

        // Hooks
        'hooks': {
            'users.auth': function(data) {
                if (!data.email || !data.token) throw "Need 'token' and 'email' for auth hook";

                var userId = data.email;
                var token = data.token;

                if (_.size(options.auth.users) > 0) {
                    if (!options.auth.users[userId] || token != options.auth.users[userId]) throw "Invalid user";
                }

                return {
                    'id': userId,
                    'name': userId,
                    'token': data.token,
                    'email': data.email
                };
            },
        },

        // Packages
        'packages': {
            'root': undefined,
            'defaults': path.resolve(__dirname, "../../packages"),
            'install': {}
        }
    }, _.defaults);

    // Unique id for workspace
    options.id = options.id ||  crc.hex32(crc.crc32(options.root))

    return options;
};
