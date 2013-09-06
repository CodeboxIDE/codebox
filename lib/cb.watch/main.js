// Requires
var _ = require('underscore');
var init = require('./init').init;


function setup(options, imports, register) {
    // Import
    var events = imports.events;

    register(null, {
        "watch": {
            init: _.partial(init, events)
        }
    });
}

// Exports
module.exports = setup;
