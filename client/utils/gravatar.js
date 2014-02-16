define([
    'hr/hr',
    'hr/utils',
    'vendors/crypto'
], function (hr, _, CryptoJS) {
    return {
        get: function(email, options) {
            options = _.defaults({}, options || {}, {
                'size': 64,
                'defaultImage': 'mm'
            });

            return "https://secure.gravatar.com/avatar/"
             + String(CryptoJS.MD5(email.toLowerCase().trim()))
             + "?size=" + options.size
             + "&default=" + encodeURIComponent(options.defaultImage);
        }
    };
});