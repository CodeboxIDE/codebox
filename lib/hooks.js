var Q = require('q');
var _ = require('lodash');
var request = require('request');

var logger = require("./utils/logger")("hooks");

var BOXID = null;
var HOOKS = {};
var POSTHOOKS = {
    'users.auth': function(data) {
        // Valid data
        if (!_.has(data, "id") || !_.has(data, "name")
        || !_.has(data, "token") || !_.has(data, "email")) {
            throw "Invalid authentication data";
        }

        return data;
    }
};
var SECRET_TOKEN = null;

// Call hook
var use = function(hook, data) {
    logger.log("call hook ", hook);

    if (!HOOKS[hook]) return Q.reject("Hook '"+hook+"' doesn't exists");

    return Q()
    .then(function() {
        var handler = HOOKS[hook];

        if (_.isFunction(handler)) {
            return Q(handler(data));
        } else if (_.isString(handler)) {
            var d = Q.defer();

            // Do http requests
            request.post(handler, {
                'body': {
                    'id': BOXID,
                    'data': data,
                    'hook': hook
                },
                'headers': {
                    'Authorization': SECRET_TOKEN
                },
                'json': true,
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    d.resolve(body);
                } else {
                    d.reject(new Error("Error with "+hook+" webhook: "+(body ? (body.error || body) : error.message)));
                }
            });

            return d.promise;
        } else {
            throw "Not a valid hook";
        }
    })
    .then(function(data) {
        if (POSTHOOKS[hook]) {
            return POSTHOOKS[hook](data);
        }
        return data;
    })
    .fail(function(err) {
        logger.error("Error with hook:");
        logger.exception(err, false);

        return Q.reject(err);
    });
};

// Init hook system
var init = function(options) {
    logger.log("init hooks");

    BOXID = options.id;
    HOOKS = options.hooks;
    SECRET_TOKEN = options.secret;
};

module.exports = {
    init: init,
    use: use
};

