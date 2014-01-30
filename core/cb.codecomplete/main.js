// Requires
var CodeComplete = require('./codecomplete').CodeComplete;


function setup(options, imports, register) {
    // Construct
    var codecomplete = new CodeComplete(
        imports.events,
        imports.workspace,
        imports.project
    );

    register(null, {
        "codecomplete": codecomplete
    });
}

// Exports
module.exports = setup;
