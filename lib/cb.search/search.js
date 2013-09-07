// Requires
var Q = require('q');
var _ = require('underscore');

var startsWith = require('../utils').startsWith;

var c9Search = new (require('./c9_search'))();

function resultReducer(dict, subDict) {
    _.pairs(subDict).forEach(function (pair) {
        var filename = pair[0], matches = pair[1];

        if(!dict[filename]) {
            dict[filename] = [];
        }

        // Push all matches
        dict[filename].push.apply(dict[filename], matches);

    });
    return dict;
}

function normalizeResults(results) {
    return results.reduce(resultReducer, {});
}

function search(root, vfs, args) {
    onData = onData || _.identity;
    var d = Q.defer();

    // List of our results
    var results = [];

    // Push results to results array
    var onData = function(result) {
        results.push(result);
    };

    var onExit = function(exitCode, errObj, info) {
        if(exitCode == 1) {
            // No results
            return d.resolve({});
        } else if(exitCode) {
            // Failed for another reason
            return d.reject(new Error("Search failed"));
        }
        // Combine results together
        return d.resolve(normalizeResults(results));
    };

    // Set root
    c9Search.setEnv({
        basePath: root
    });

    // Do Search
    var ok = c9Search.exec(args, vfs, onData, onExit);

    if(!ok) {
        d.reject(new Error('Could not run search'));
    }

    return d.promise;
}

// Exports
exports.search = search;