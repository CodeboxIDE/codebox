// Requires
var EventEmitter = require('eventemitter2').EventEmitter2;

var methodObj = require('../utils').methodObj;


function setup(options, imports, register) {
    // Construct
    var emitter = new EventEmitter();

    // Register
    register(null, {
        "events": methodObj(emitter)
    });
}

// Exports
module.exports = setup;
