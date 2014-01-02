// Requires
var ProjectRunner = require('./project').ProjectRunner;


function setup(options, imports, register) {
    // Construct
    var runner = new ProjectRunner(
        imports.events,
        imports.workspace,
        imports.shells,
        imports.run_ports,
        imports.project_detect,
        options.urlPattern
    );

    register(null, {
        "run_project": runner
    });
}

// Exports
module.exports = setup;
