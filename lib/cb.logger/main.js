var _ = require("underscore");

function setup(options, imports, register) {
	// Colors for log types
	var colors = {
		'log': ['\x1B[36m', '\x1B[39m'],
	    'error': ['\x1B[31m', '\x1B[39m']
	};

	// Base print method
	var print = function(logType, logSection) {
		var args = Array.prototype.slice.call(arguments, 2);
		args.splice(0, 0, colors[logType][0]+"["+logType+"]"+colors[logType][1]+"["+logSection+"]");
		console.log.apply(console, args);
	};

	var error = _.partial(print, 'error');
	var log = _.partial(print, 'log');
	var exception = _.wrap(error, function(func, logSection, err, kill) {
		func(logSection, "Error ", err.message);
		console.error(err.stack);

        // Kill process
        if (kill != false) process.exit(1);
	});

    register(null, {
	    'logger': {
			'log': log,
			'error': error,
			'exception': exception,

			'namespace': function(name) {
				return {
					'log': _.partial(log, name),
					'error': _.partial(error, name),
					'exception': _.partial(exception, name)
				}
			}
		}
    });
};

// Exports
module.exports = setup;
