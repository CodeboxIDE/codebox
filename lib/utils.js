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

// Exports
exports.exec = exec;
exports.qnode = qnode;
exports.execFile = execFile;
exports.constant = constant;
