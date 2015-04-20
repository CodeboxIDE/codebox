var _ = require('lodash');
var Q = require('q');

var TEMPLATES = {
    'default': require('./default'),
    'local': require('./local'),
    'env': require('./env')
};

// Generate a complete config from templates
module.exports = function(options) {
    var templates = _.unique(["default"].concat((options.templates || "local,env").split(",")));

    return _.reduce(templates, function(prev, template) {
        return prev.then(function(_options) {
            if (!TEMPLATES[template]) throw "Invalid template '"+template+"'";

            return TEMPLATES[template](_options);
        });
    }, Q(options));
};
