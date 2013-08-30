// Requires
var shux = require('shux');

function setup(options, imports, register) {

    // Construct
    var manager = shux();

    // Register
    register(null, {
        "shells": {
            manager: manager
        }
    });
}

// Exports
module.exports = setup;