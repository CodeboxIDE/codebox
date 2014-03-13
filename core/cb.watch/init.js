// Requires
var Q = require('q');
var _ = require('lodash');
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
                    error: err || null
                };

                events.emit(emitStr, info);
            },
            change: batch(function(changeType, filePath, fileCurrentStat, filePreviousStat) {
                // Simply queue the data for our batch processor
                return {
                    change: changeType,
                    path: normalize(filePath),
                    stats: {
                        current: fileCurrentStat,
                        old: filePreviousStat
                    }
                };
            }, function process(eventList) {
                // Aggregate events by folder
                var folderEvents = _(eventList).reduce(function(context, e) {
                    // Aggregate by parent folder of changed path
                    var key = path.dirname(e.path);

                    // Set list if empty
                    if(context[key] === undefined) {
                        context[key] = [];
                    }

                    // Add event to folder's event list
                    context[key].push(e);

                    return context;
                }, {});

                // Refresh each of those changed folders
                _.each(folderEvents, function(eventList, folder) {
                    // Many events, so group by folder
                    if(eventList.length >= 3) {
                        // Send out aggregated event
                        return events.emit('watch.change.folder', {
                            change: 'folder',
                            path: folder
                        });
                    }

                    // Few events so send them out individually
                    _.each(eventList, function(e) {
                        events.emit(
                            // e.change can be any of
                            // ['updated', 'created', 'deleted']
                            'watch.change.'+e.change,

                            // Actual event data
                            e
                        );

                    });
                });


            }, {
                // Debounce 200ms
                debounce: 100,

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
