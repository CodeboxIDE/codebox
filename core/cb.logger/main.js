var _ = require("lodash");

function setup(options, imports, register) {
	var events = imports.events;

	// Colors for log types
	var colors = {
		'log': ['\x1B[36m', '\x1B[39m'],
	    'error': ['\x1B[31m', '\x1B[39m']
	};

	// Base print method
	var print = function(logType, logEmit, logSection) {
		var args = Array.prototype.slice.call(arguments, 3);
		args.splice(0, 0, colors[logType][0]+"["+logType+"]"+colors[logType][1]+"["+logSection+"]");
		console.log.apply(console, args);
		if (logEmit) events.emit("log", {
			'type': logType,
			'section': logSection,
			'content': Array.prototype.slice.call(arguments, 3)
		});
	};

	var error = _.partial(print, 'error');
	var log = _.partial(print, 'log');
	var exception = _.wrap(error, function(func, logEmit, logSection, err, kill) {
		func(logEmit, logSection, "Error ", err.message || err);
		console.error(err.stack);

        // Kill process
        if (kill != false) process.exit(1);
	});

    register(null, {
	    'logger': {
			'log': _.partial(log, false),
			'error': _.partial(error, false),
			'exception': _.partial(exception, false),

			'namespace': function(name, logEmit) {
				logEmit = logEmit || false;
				return {
					'log': _.partial(log, logEmit, name),
					'error': _.partial(error, logEmit, name),
					'exception': _.partial(exception, logEmit, name),
				}
			}
		}
    });
};

// Exports
module.exports = setup;
