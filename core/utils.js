// Requires
var Q = require('q');
var _ = require('lodash');

var cp = require('child_process');


// Generate callbacks for exec functions
function _execHandler(command, deffered) {
    return function(error, stdout, stderr) {
        if(error) {
            error.message += command + ' (exited with error code ' + error.code + ')';
            error.stdout = stdout;
            error.stderr = stderr;

            return deffered.reject(error);
        }
        return deffered.resolve({
            stdout: stdout,
            stderr: stderr,
        });
    };
}

// Execution stuff
function simpleExecBuilder(execFunction) {
    return function(command) {
        var deffered = Q.defer();

        var args = _.toArray(arguments).concat(_execHandler(command, deffered));

        // Call exec function
        execFunction.apply(null, args);

        return deffered.promise;
    };
}

var exec = simpleExecBuilder(cp.exec);
var execFile = simpleExecBuilder(cp.execFile);


// Builds a function that always returns value no matter the input
function constant(value) {
    return function() {
        return value;
    };
}

// Transform a promise returning function
// to support dnode
function qnode(func) {
    return function() {
        var args = _.toArray(arguments);
        var cb = args.pop();
        var endFunc = _.partial(func, args);

        return endFunc()
        .then(
            _.partilal(cb, null)
        )
        .fail(cb);
    };
}

// Takes an object with methods
// and builds a new object
// with the same methods (bound to the source)
// but without the attributes
//
// This is useful for exposing things
// in our module system
//
// !!! This is not recursive (not needed)
function methodObj(obj) {
    var methods = _.methods(obj);
    var newObj = {};

    methods.forEach(function(method) {
        newObj[method] = obj[method].bind(obj);
    });

    return newObj;
}

// Return a timestamp of the curent time
function timestamp() {
    return Math.floor(Date.now() / 1000);
}

// Does the string str start with toCheck
function startsWith(str, toCheck) {
    return str.indexOf(toCheck) === 0;
}


// Wrap a given function to support batch processing
function batch(func, processor, options) {
    // func is optional
    if(arguments.length < 3) {
        options = processor;
        processor = func;
        func = _.identity;
    }

    // Parse and default args
    options = options || {};

    // If no debounce options was passed set n to 1
    options.n = options.debounce ? options.n : 1;

    // A queue to store the return value of "func"
    // that will then be processed by "processor"
    var queue = [];

    var processQueue = function processQueue() {
        // Let the processor, process all the data in the queue
        processor(queue);

        // Empty queue
        queue = [];
    };

    var debounced = (options.debounce !== undefined) ?
        _.debounce(processQueue, options.debounce) :
        processQueue;

    return function() {
        var value = func.apply(null, arguments);
        queue.push(value);

        // Call our debounced queue processor
        debounced();

        // Force call if queue is getting to big
        if(options.n && queue.length >= options.n) {
            processQueue();
        }

        return value;
    };
}

var btoa = function(s) {
    return (new Buffer(s)).toString('base64');
};

var atob = function(s) {
    return (new Buffer(s, 'base64')).toString('utf8');
};

// Transform {a: {b: 1}} -> {"a.b": 1}
var deepkeys = function(obj, all) {
    var keys= {};
    var getBase = function(base, key) {
        if (_.size(base) == 0) return key;
        return base+"."+key;
    };

    var addKeys = function(_obj, base) {
        var _base, _isObject;
        base = base || "";

        _.each(_obj, function(value, key) {
            _base = getBase(base, key);
            _isObject = _.isObject(value) && !_.isArray(value);

            if (_isObject) addKeys(value, _base);
            if (all == true || !_isObject) keys[_base] = value;
        });
    };

    addKeys(obj);

    return keys;
};

// Exports
exports.exec = exec;
exports.qnode = qnode;
exports.batch = batch;
exports.execFile = execFile;
exports.constant = constant;
exports.methodObj = methodObj;
exports.timestamp = timestamp;
exports.startsWith = startsWith;
exports.atob = atob;
exports.btoa = btoa;
exports.deepkeys = deepkeys;
