// Requires
var Q = require('q');
var _ = require('underscore');

var cp = require('child_process');

var arrays, basicObjects, deepClone, deepExtend, deepExtendCouple, isBasicObject, sum, __slice = [].slice;

deepClone = function(obj) {
    var func, isArr;
    if (!_.isObject(obj) || _.isFunction(obj)) {
        return obj;
    }
    if (_.isDate(obj)) {
        return new Date(obj.getTime());
    }
    if (_.isRegExp(obj)) {
        return new RegExp(obj.source, obj.toString().replace(/.*\//, ""));
    }
    isArr = _.isArray(obj || _.isArguments(obj));
    func = function(memo, value, key) {
        if (isArr) {
            memo.push(deepClone(value));
        } else {
            memo[key] = deepClone(value);
        }
        return memo;
    };
    return _.reduce(obj, func, isArr ? [] : {});
};

isBasicObject = function(object) {
    return (object != null && (object.prototype === {}.prototype || object.prototype === Object.prototype) && _.isObject(object) && !_.isArray(object) && !_.isFunction(object) && !_.isDate(object) && !_.isRegExp(object) && !_.isArguments(object));
};

basicObjects = function(object) {
    return _.filter(_.keys(object), function(key) {
        return isBasicObject(object[key]);
    });
};

arrays = function(object) {
    return _.filter(_.keys(object), function(key) {
        return _.isArray(object[key]);
    });
};

deepExtendCouple = function(destination, source, maxDepth) {
    var combine, recurse, sharedArrayKey, sharedArrayKeys, sharedObjectKey, sharedObjectKeys, _i, _j, _len, _len1;
    if (maxDepth == null) {
        maxDepth = 20;
    }
    if (maxDepth <= 0) {
        console.warn('_.deepExtend(): Maximum depth of recursion hit.');
        return _.extend(destination, source);
    }
    sharedObjectKeys = _.intersection(basicObjects(destination), basicObjects(source));
    recurse = function(key) {
        return source[key] = deepExtendCouple(destination[key], source[key], maxDepth - 1);
    };
    for (_i = 0, _len = sharedObjectKeys.length; _i < _len; _i++) {
        sharedObjectKey = sharedObjectKeys[_i];
        recurse(sharedObjectKey);
    }
    sharedArrayKeys = _.intersection(arrays(destination), arrays(source));
    combine = function(key) {
        return source[key];
        // Replace array and not replaced
        //return source[key] = _.union(destination[key], source[key]);
    };
    for (_j = 0, _len1 = sharedArrayKeys.length; _j < _len1; _j++) {
        sharedArrayKey = sharedArrayKeys[_j];
        combine(sharedArrayKey);
    }
    return _.extend(destination, source);
};

deepExtend = function() {
    var finalObj, maxDepth, objects, _i;
    objects = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), maxDepth = arguments[_i++];
    if (!_.isNumber(maxDepth)) {
        objects.push(maxDepth);
        maxDepth = 20;
    }
    if (objects.length <= 1) {
        return objects[0];
    }
    if (maxDepth <= 0) {
        return _.extend.apply(this, objects);
    }
    finalObj = objects.shift();
    while (objects.length > 0) {
        finalObj = deepExtendCouple(finalObj, deepClone(objects.shift()), maxDepth);
    }
    return finalObj;
};

sum = function(obj) {
  if (!$.isArray(obj) || obj.length == 0) return 0;
  return _.reduce(obj, function(sum, n) {
    return sum += n;
  });
};

_.mixin({
    deepClone: deepClone,
    isBasicObject: isBasicObject,
    basicObjects: basicObjects,
    arrays: arrays,
    deepExtend: deepExtend,
    sum: sum
});

// Generate callbacks for exec functions
function _execHandler(deffered) {
    return function(error, stdout, stderr) {
        if(error) {
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
    } else if(_.isString(obj) || _.isNumber(obj)) {
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
exports.execFile = execFile;
exports.constant = constant;
exports.methodObj = methodObj;
exports.wireFriendly = wireFriendly;
exports.timestamp = timestamp;
exports.startsWith = startsWith;
