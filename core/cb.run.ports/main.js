// Requires
var qClass = require('qpatch').qClass;

var harbor = qClass(require('harbor'));


function setup(options, imports, register) {
    // Harbor helps ensure that we don't claim already used ports
    // and we can then simply get a list of services running that were
    // intended to be run from this workspace
    // (useful if running multiple codebox instances)
    var _harbor = new harbor(options.min, options.max);

    register(null, {
        "run_ports": _harbor
    });
}

// Exports
module.exports = setup;
