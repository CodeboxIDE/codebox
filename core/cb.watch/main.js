// Requires
var _ = require('lodash');
var init = require('./init').init;


function setup(options, imports, register) {
    // Import
    var events = imports.events;
    var logger = imports.logger.namespace("watch");

    register(null, {
        "watch": {
            init: _.partial(init, logger, events)
        }
    });
}

// Exports
module.exports = setup;
