var _ = require("lodash");

// State
var enabled = true;

// Colors for log types
var colors = {
    'log': ['\x1B[36m', '\x1B[39m'],
    'error': ['\x1B[31m', '\x1B[39m']
};

// Base print method
var print = function(logType, logSection) {
    if (!enabled) return;

    var args = Array.prototype.slice.call(arguments, 2);
    args.splice(0, 0, colors[logType][0]+"["+logType+"]"+colors[logType][1]+"["+logSection+"]");
    console.log.apply(console, args);
};

var error = _.partial(print, 'error');
var log = _.partial(print, 'log');
var exception = _.wrap(error, function(func, logSection, err, kill) {
    func(logSection, err.message || err);
    if (err.stack) console.error(err.stack);

    // Kill process
    if (kill != false) process.exit(1);
});

// Enable/Disable logging
var toggle = function(st) {
    enabled = st;
};

// Init logging
var init = function(config) {
    if (config.log !== undefined) {
        toggle(config.log);
    }
};

module.exports = function(name) {
    return {
        'log': _.partial(log, name),
        'error': _.partial(error, name),
        'exception': _.partial(exception, name)
    };
};

module.exports.toggle = toggle;
module.exports.init = init;
