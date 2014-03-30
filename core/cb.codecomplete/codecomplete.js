var Q = require('q');
var _ = require('lodash');
var path = require('path');
var utils = require('../utils');


function CodeComplete(events, workspace, project) {
    this.events = events;
    this.workspace = workspace;
    this.project = project;
    this.handlers = [];

    _.bindAll(this);
};

/*
 *  Add a handler for codecompletion
 *  The 'handler' function will be called with an option object
 *  and should return a list of tag with the format:
 *  {
 *      'name': "Tag name",
 *      'file': "path relative to the workspace root",
 *      'score': 1,  // It will default to 1
 *      'meta': "meta information: ex: 'class', 'function'",
 *      'content': "Description html content"
 *  }
 */
CodeComplete.prototype.addHandler = function(name, handler) {
    var _handler = _.find(this.handlers, function(h) {
        return h.name == name;
    })
    if (_handler) {
        return Q.reject(new Error("Handler already exists"));
    }
    this.handlers.push({
        'name': name,
        'handler': handler
    });
    return Q();
}


/*
 *  Add a tags indexer for codecompletion
 *  The populate will be called when necessaray to update a tags idnex used
 *  to return codecompletion results
 */
CodeComplete.prototype.addIndex = function(name, populate, options) {
    var that = this;
    var index = null;
    var inProgress = null;

    options = _.defaults({}, options || {}, {
        'interval': 60*1000 //1min
    })

    var populateIndex = function() {
        if (inProgress) return inProgress;

        inProgress = Q(populate({
            'root': that.workspace.root,
            'project': that.project
        })).then(function(items) {
            index = items;
        }, function(err) {
            index = null;
            return Q.reject(err);
        }).fin(function() {
            inProgress = null;
        });

        return inProgress;
    };

    // Populate the index when there are changes
    var throttled = _.throttle(populateIndex, options.interval);
    this.events.on("watch.change.update", throttled);
    this.events.on("watch.change.create", throttled);
    this.events.on("watch.change.delete", throttled);
    

    // Add namespace
    this.addHandler(name, function(options) {
        var prepare = Q();

        // if no index yet: populate the index
        if (!index) {
            prepare = populateIndex();
        }

        // If processing new data, wait for new update
        if (inProgress) prepare = inProgress;

        // Filter the index for getting the results
        return prepare.then(function() {
            // Filter is done by the 'get'
            return index;
        });
    });
}


/*
 *  Return results for completion
 *  Option can be used to filter by file, query, ...
 */
CodeComplete.prototype.get = function(options) {
    var that = this;

    options = _.defaults({}, options || {}, {
        // Filter name with query
        'query': "",

        // Filter filepath with file
        'file': null
    });

    var results = [];

    // Get all results from all the handlers
    return Q.allSettled(_.map(this.handlers, function(handler, i) {
        return Q(handler.handler(options, handler.name)).then(function(_results) {
            results = results.concat(_results);
        });
    })).then(function(handlerStates) {

        results = _.chain(results)
        // Filter results
        .filter(function(result) {
            // Check format
            if (!result.name) return false;

            // Filter the result
            if (options.file && result.file.indexOf(options.file) != 0) return false
            if (options.query && result.name.indexOf(options.query) != 0) return false;

            return true;
        })

        // Remove doublons
        .uniq(function(result) {
            return result.name;
        })

        // Order results
        .sortBy(function(result) {
            return result.score;
        })
        .value();

        return {
            // List of results
            'results': results,

            // State of handlers
            'handlers': _.map(that.handlers, function(handler, i) {
                return {
                    'handler': handler.name,
                    'state': handlerStates[i].state,
                    'error': handlerStates[i].reason ? handlerStates[i].reason.message : undefined
                };
            })
        };
    })
}

// Exports
exports.CodeComplete = CodeComplete;
