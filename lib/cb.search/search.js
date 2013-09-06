// Requires
var Q = require('q');
var _ = require('underscore');

var startsWith = require('../utils').startsWith;

var c9Search = new (require('./c9_search'))();


var FILE_LINE_PREFIX = '//';

function parseResult(result) {
    var data = result.data;

    console.dir(result);

    var results = {
        /**
         * FORMAT :
        filename: [
            [23, 'source code of line 23'],
            [29, 'source code of line 29'],
        ],
        ...
        */
    };

    var currentFile = null;
    var lines = data.split('\n');

    // Group lines
    lines.forEach(function(line) {
        line = line.trim();

        // File line
        if(startsWith(line, FILE_LINE_PREFIX)) {
            // Get filename
            currentFile = line.slice(FILE_LINE_PREFIX.length, line.length - 1);

            // Create result entry for file
            results[currentFile] = [];
            return;
        }

        // Result line
        var slicer = line.indexOf(':');

        var linenum = Number(line.slice(0, slicer));
        var source = line.slice(slicer+1);

        if(currentFile && !_.isNaN(linenum)) {
            results[currentFile].push([
                linenum,
                source
            ]);
        } else {
            console.log('Bad line =', line);
        }
    });

    return results;
}

function search(root, vfs, args) {
    onData = onData || _.identity;
    var d = Q.defer();

    // List of our results
    var results = [];

    // Push results to results array
    var onData = function(result) {
        results.push(parseResult(result));
    };

    var onExit = function(exitCode, errObj, info) {
        console.log('EXITED');

        if(exitCode) {
            return d.reject(new Error("Search failed"));
        }
        return d.resolve(results);
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