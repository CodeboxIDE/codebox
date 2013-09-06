// Requires
var Q = require('q');
var _ = require('underscore');

var path = require('path');

var watchr = require('watchr');


function init(events, rootPath) {
    var d = Q.defer();

    // Normalize paths
    function normalize(fullPath) {
        return path.normalize(
            '/' + path.relative(rootPath, fullPath)
        );
    }

    console.log('Starting Watch');
    // Construct
    watchr.watch({
    paths: [rootPath],
    listeners: {
        log: function(logLevel) {
            /*
            events.emit('watch.log', {
                level: logLevel,
                args: _.toArray(arguments)
            });
            */
        },
        error: function(err) {
            events.emit('watch.error', err);
        },
        watching: function(err, watcherInstance, isWatching) {
            var emitStr = 'watch.watching.' + (err ? 'error' : 'success');
            var info = {
                watching: isWatching,
                path: normalize(watcherInstance.path),
                _instance: watcherInstance,
                error: err || null
            };



            events.emit(emitStr, info);
        },
        change: function(changeType, filePath, fileCurrentStat, filePreviousStat) {
            // changeType can be any of
            // ['updated', 'created', 'deleted']
            var emitStr = 'watch.change.' + changeType;
            var info = {
                change: changeType,
                path: normalize(filePath),
                stats: {
                    current: fileCurrentStat,
                    old: filePreviousStat
                }
            };

            events.emit(emitStr, info);
        }
    },
    next: function(err, watchers) {
        // Fail building Codebox on error
        if (err) {
            return d.reject(err);
        }

        return d.resolve(watchers);
    }
    });

    return d.promise;
}


// Exports
exports.init = init;