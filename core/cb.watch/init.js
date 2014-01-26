// Requires
var Q = require('q');
var _ = require('underscore');
var path = require('path');
var watchr = require('watchr');

var batch = require('../utils').batch;


function init(logger, events, rootPath) {
    var d = Q.defer();

    // Normalize paths
    function normalize(fullPath) {
        return path.normalize(
            '/' + path.relative(rootPath, fullPath)
        );
    }

    logger.log('Starting Watch');
    // Construct
    watchr.watch({
        paths: [rootPath],

        // Following links causes issues with broken symlinks
        // crashing the whole watchr instance and thus codebox
        // so disabling link following for now
        followLinks: false,

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
                    state: watcherInstance.state,
                    path: normalize(watcherInstance.path),
                    _instance: watcherInstance,
                    error: err || null
                };

                events.emit(emitStr, info);
            },
            change: batch(function(changeType, filePath, fileCurrentStat, filePreviousStat) {
                // changeType can be any of
                // ['updated', 'created', 'deleted']
                var emitStr = 'watch.change.' + changeType;

                return {
                    change: changeType,
                    path: normalize(filePath),
                    stats: {
                        current: fileCurrentStat,
                        old: filePreviousStat
                    }
                };
            }, function process(eventList) {
                var changedFolders = _(eventList).reduce(function(context, e) {
                    // Add folder to set
                    context[path.dirname(e.path)] = null;
                    return context;
                }, {}).keys();

                // Refresh each of those changed folders
                _.each(changedFolders, function(folder) {
                    events.emit('watch.change.folder', {
                        change: 'folder',
                        path: folder
                    });
                });


            }, {
                // Debounce 200ms
                debounce: 200,

                // Force processing every 1000 events
                n: 1000
            })
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
