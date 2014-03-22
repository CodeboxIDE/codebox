var Q = require("q");
var _ = require("lodash");
var request = require("request");

var method = function(key, httpMethod, endpoint, options) {
    var d = Q.defer();
    request(_.extend({
        method: httpMethod,
        url: "https://api.heroku.com/"+endpoint,
        json: true,
        headers: {
            "Accept": "application/vnd.heroku+json; version=3",
            "Authorization": "Basic "+(new Buffer(":" + key).toString('base64'))
        }
    }, options || {}),
    function(error, response, body) {
        if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
            d.resolve(body);
        } else {
            d.reject(error || body.message || body);
        }
    });

    return d.promise;
};

module.exports = {
    'method': method
};