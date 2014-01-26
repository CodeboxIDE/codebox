var Q = require('q');
var _ = require('underscore');
var path = require('path');
var utils = require('../utils');


function CodeComplete(events, workspace) {
    this.events = events;
    this.workspace = workspace;
    this.handlers = {};

    _.bindAll(this);
}

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
    if (this.handlers[name]) {
        return Q.reject(new Error("Handler already exists"));
    }
    this.handlers[name] = handler;
    return Q();
}


/*
 *  Add a tags indexer for codecompletion
 *  The populate will be called when necessaray to update a tags idnex used
 *  to return codecompletion results
 */
CodeComplete.prototype.addIndex = function(name, populate) {
    var that = this;
    var index = null;

    var populateIndex = function() {
        return Q(populate({
            'root': that.workspace.root
        })).then(function(items) {
            index = items;
        }, function(err) {
            index = null;
            console.log("index failed: ", err);
        });
    };

    // Add namespace
    this.addHandler(name, function(options) {
        var prepare = Q();

        // if no ndex yet: populate the index
        if (!index) {
            prepare = populateIndex();
        }

        // Filter the index for getting the results
        return prepare.then(function() {
            return _.filter(index, function(tag) {
                return true;
            });
        });
    });
}


/*
 *  Return results for completion
 *  Option can be used to filter by file, query, ...
 */
CodeComplete.prototype.get = function(options) {
    options = _.defaults({}, options || {}, {
        'query': "",
        'file': null
    });

    var results = [];

    return Q.all(_.map(this.handlers, function(handler, name) {
        return Q(handler(options, name)).then(function(_results) {
            results = results.concat(_results);
        });
    })).then(function() {
        return results;
    })
}

// Exports
exports.CodeComplete = CodeComplete;
