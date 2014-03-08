var Q = require("q");
var _ = require("lodash");
var request = require("request");

// get content from an addons registry
var get = function(url, options) {
    var d = Q.defer();
    request(_.extend({
        method: "GET",
        url: url+"/api/addons?limit=1000",
        json: true,
        headers: {}
    }, options || {}),
    function(error, response, body) {
        if (!error && response.statusCode == 200) {
            d.resolve(body);
        } else {
            d.reject(error || body.message || body);
        }
    });

    return d.promise;
};

module.exports = {
    'get': get
};