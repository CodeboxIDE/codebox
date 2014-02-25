// Requires
var _ = require('lodash');
var Q = require('q');
var request = require('request');


function setup(options, imports, register) {
	var logger = imports.logger.namespace("hooks");
	var settings = imports.settings;

	// Defaults hooks
	var baseHooks = _.defaults(options.hooks || {}, {
		// Auth an user
		'auth': function(data) {
			if (!data.email
			|| !data.token) {
				return Q.reject(new Error("Need 'token' and 'email' for auth hook"));
			}

			var userId = data.email;

			return {
				'userId': userId,
				'name': userId,
				'token': data.token,
				'email': data.email
			};
		},

		// Report list of events
		'events': function() {},

		// Store and valid user settings
		'settings': function(data) {
			settings.extend(data.auth.userId, {
				'settings': data.settings
			});
			return settings.save().then(function() {
				return data.settings;
			})
		},

		// Valid installation of an addon
		'addons': function(addon) {
			return true;
		}
	});

	// Post operations for hooks
	// can be used for validation
	var postHooks = {
		'auth': function(data) {
			// Valid data
			if (!_.has(data, "userId") || !_.has(data, "name")
			|| !_.has(data, "token") || !_.has(data, "email")) {
				return Q.reject(new Error("Invalid authentication data"));
			}

			// Load base settings if no settings
			data.settings = data.settings || settings.get(data.userId, {}).settings || {};
			return data;
		}
	};


	// Use a hook
	//	-> if function: call the function
	//	-> if string: do http request
	var useHook = function(hook, data) {
		return Q()

		// Call hook
		.then(function() {
			if (baseHooks[hook] == null) {
				var err = new Error("Error trying to use inexistant hook: "+hook);
				logger.exception(err, false);
				return Q.reject(err);
			}

			var handler = baseHooks[hook];
			logger.log("use hook", hook);
			if (_.isFunction(handler)) {
				return Q(handler(data));
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
						d.reject(new Error("Error with "+hook+" webhook: "+(body ? (body.error || body) : error.message)));
					}
				});

				return d.promise;
			} else {
				var err = new Error("Not a valid hook");
				logger.exception(err, false);
				return Q.reject();
			}
		})

		// Post hooks
		.then(function(data) {
			if (postHooks[hook]) {
				return postHooks[hook](data);
			}
			return data;
		});
	};

    register(null, {
	    'hooks': {
			'use': useHook
		}
    });
};

// Exports
module.exports = setup;
