// Requires
var Q = require('q');
var _ = require('underscore');

var cp = require('child_process');

// Generate callbacks for exec functions
function _execHandler(deffered) {
    return function(error, stdout, stderr) {
        if(error) {
            return deffered.reject(Error(error));
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

        var args = _.toArray(arguments).concat(_execHandler(deffered));

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

// Create a failed promise from an error
function qfail(error) {
    var d = Q.defer();
    d.reject(error);
    return d.promise;
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

function wireFriendly(obj) {
    if(_.isArray(obj)) {
        return _.map(obj, wireFriendly);
    } else if(_.isString(obj)) {
        return obj;
    }

    var newObj = {};
    var pairs = _.pairs(obj);

    pairs.forEach(function(pair) {
        var key = pair[0], value = pair[1];

        // Skip functions and keys starting with a lower dash
        if(_.isFunction(value) || key[0] == '_') {
            return;
        }

        // Set
        newObj[key] = value;
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

// Exports
exports.exec = exec;
exports.qnode = qnode;
exports.qfail = qfail;
exports.execFile = execFile;
exports.constant = constant;
exports.methodObj = methodObj;
exports.wireFriendly = wireFriendly;
exports.timestamp = timestamp;
exports.startsWith = startsWith;
