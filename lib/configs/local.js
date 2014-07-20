var _ = require('lodash');

// Base structure for a local workspace
// Store the workspace configuration in a file, ...
module.exports = function(options) {
    options = _.defaults(options, {
        'hooks': {
            'settings.get': function() {

            },
            'settings.set': function(data) {

            }
        }
    });

    return options;
};
