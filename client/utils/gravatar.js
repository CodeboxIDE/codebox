define([
    'hr/hr',
    'hr/utils',
    'utils/hash'
], function (hr, _, hash) {
    return {
        get: function(email, options) {
            options = _.defaults({}, options || {}, {
                'size': 64,
                'defaultImage': 'mm'
            });

            return "https://secure.gravatar.com/avatar/"
             + hash.md5(email.toLowerCase().trim())
             + "?size=" + options.size
             + "&default=" + encodeURIComponent(options.defaultImage);
        }
    };
});