var _ = require("underscore");
var Q = require('q');
var request = require('request');
var qfail = require('../utils').qfail;

function setup(options, imports, register) {
	var logger = imports.logger.namespace("hooks");

	// Defaults hooks
	var baseHooks = _.defaults(options.hooks || {}, {
		// Auth an user
		'auth': function(data) {
			if (!data.email
			|| !data.token) {
				return qfail(new Error("Need 'token' and 'email' for auth hook"));
			}

			var userId = _.uniqueId("user");

			return Q({
				'userId': userId,
				'name': userId,
				'token': data.token,
				'email': data.email,
				'settings': {}
			});
		},

		// Report list of events
		'events': null,

		// Store and valid user settings
		'settings': function(data) {
			return Q(data);
		},

		// Valid installation of an addon
		'addon': function(addon) {
			return Q(true);
		}
	});

	// Use a hook
	//	-> if function: call the function
	//	-> if string: do http request
	var useHook = function(hook, data) {
		if (baseHooks[hook] == null) {
			var err = new Error("Error trying to use inexistant hook: "+hook);
			logger.exception(err, false);
			return qfail(err);
		}

		var handler = baseHooks[hook];
		logger.log("use hook", hook);
		if (_.isFunction(handler)) {
			return handler(data);
		} else if (_.isString(handler)) {
			var d = Q.defer();

			// Do http requests
			request.post(handler, {
	            'body': {
	            	'data': data,
	            	'hook': hook
	            },
	            'headers': {
	            	'Authorization': options.webAuthToken
	            },
	            'json': true,
	        }, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					d.resolve(body);
				} else {
					logger.error("Error with hook:", hook, error, body);
					d.reject(new Error("Error with webhook: "+hook));
				}
			});

			return d.promise;
		} else {
			var err = new Error("Not a valid hook");
			logger.exception(err, false);
			return qfail();
		}
	};

    register(null, {
	    'hooks': {
			'use': useHook 
		}
    });
};

// Exports
module.exports = setup;
