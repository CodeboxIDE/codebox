// Requires
var _ = require('lodash');
var Watcher= require('./watcher');


function setup(options, imports, register) {
    // Import
    var events = imports.events;
    var logger = imports.logger.namespace("watch");

    var watcher = new Watcher(logger, events);

    register(null, {
        "watch": watcher
    });
}

// Exports
module.exports = setup;
