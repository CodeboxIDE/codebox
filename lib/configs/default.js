var _ = require('lodash');
var crc = require('crc');
var path = require('path');

// Base structure for a configuration
module.exports = function(options) {
    options = _.merge(options, {
        // Debug
        'debug': false,

        // Port for running the webserver
        'port': 3000,

        // Root folder
        'root': process.cwd(),

        // Workspace title
        'title': "Codebox",

        // Workspace id
        'id': null,

        // Secret identifier for the workspace
        'secret': null,

        // Events reporting
        'reporting': {
            'timeout': 180
        },

        // Authentication settings
        'auth': {
            // Redirect user to this url for auth
            'redirect': undefined,
        },

        // Hooks
        // If value is string: POST to the url
        // If function: executed
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
            'events': undefined,
            'settings.get': undefined,
            'settings.set': undefined
        },

        // Packages
        'packages': {
            // Path to store all packages for the user
            'root': undefined,

            // Path to default packages
            'defaults': path.resolve(__dirname, "../../packages"),

            // Packages to install when booting
            'install': {}
        }
    }, _.defaults);

    // Unique id for workspace
    options.id = options.id ||  crc.hex32(crc.crc32(options.root))

    return options;
};
