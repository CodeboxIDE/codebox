var _ = require("lodash");

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
    func(logSection, err.message || err);
    console.error(err.stack);

    // Kill process
    if (kill != false) process.exit(1);
});

module.exports = function(name) {
    return {
        'log': _.partial(log, name),
        'error': _.partial(error, name),
        'exception': _.partial(exception, name)
    };
};