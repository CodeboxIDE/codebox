// Requires
var Q = require('q');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var harmonycollections = require("harmony-collections");

// Hack for pathwatcher and not be dependant on node option --harmony
global.WeakMap = harmonycollections.WeakMap;

var PathWatcher = require("pathwatcher");

var batch = require('../utils').batch;

var Watcher = function(logger, events) {
    this.logger = logger;
    this.events = events;
    this.rootPath = "/";
    this.watchers = {};
}

// Init te watcher with a root path
Watcher.prototype.init = function(rootPath) {
    this.logger.log("init", rootPath);
    this.rootPath = rootPath;
    this.start("./");
    this.start("./hello.py");
}

// Normalize a path to the root path
Watcher.prototype.normalize = function(fullPath) {
    return path.normalize(
        '/' + path.relative(this.rootPath, fullPath)
    );
}

// Start watching a path
Watcher.prototype.start = function(basePath) {
    var that = this;

    // already watching this file
    if (this.watchers[basePath]) return;

    this.logger.log("start", basePath);

    this.watchers[basePath] = PathWatcher.watch(path.join(this.rootPath, basePath), function() {
        console.log(basePath, arguments);
    });
    this.watchers[basePath].handleWatcher.on("change", function() {
        console.log(basePath, "2", arguments);
    });

    /*this.watchers[basePath] = fs.watch(
        path.join(this.rootPath, basePath),
        {

        },
        batch(function(changeType, filePath) {
            console.log(changeType, filePath);
            // Simply queue the data for our batch processor
            return {
                change: changeType,
                path: that.normalize(filePath),
                stats: {
                    current: {},
                    old: {}
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
                    return that.events.emit('watch.change.folder', {
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
        })
    )*/
}

// Stop watching a path
Watcher.prototype.stop = function (basePath) {

    this.logger.log("stop", rootPath);

    if (!this.watchers[basePath]) {
        this.logger.error("Trying to stop inexistant watcher");
    } else {
        this.watchers[basePath].close();
        delete this.watchers[basePath];

        this.events.emit("watch.stop", {
            path: this.normalize(basePath)
        });
    }
}

// Exports
module.exports = Watcher;
