// Requires
var _ = require('underscore');

var shux = require('shux');


function setup(options, imports, register) {
    var events = imports.events;
    var workspace = imports.workspace;

    // Construct
    var manager = shux();
    var oldCreateShell = manager.createShell.bind(manager);

    // Monkey patch createShell
    manager.createShell = function(id, opts) {
        return oldCreateShell(id, _.defaults(opts || {}, {
            cwd: workspace.root
        }));
    };

    // Simplify shell creation
    manager.createShellCommand = function(shellId, cmd, args, opts) {
        var exitCMD = "read -p  $'####\\n# Press \\e[00;31mENTER\\e[00m to close this shell ...\\n####\\n'";
        var shell = manager.createShell(_.defaults({}, opts || {}, {
            id: shellId,
            command: "bash",
            arguments: ['-c', (args || []).concat([';',exitCMD]).join(' ')],
            cwd: workspace.root
        }));

        return shell;
    }


    // Utility function for connecting emitter to eventbus
    // (converts arguments to data convention)
    var emit = function shellEmit(eventId, shellId) {
        return events.emit(eventId, {
            shellId: shellId
        });
    };

    // Connect shell manger to event bus
    manager.on('exit', _.partial(emit, 'shell.exit'));
    manager.on('spawn', _.partial(emit, 'shell.spawn'));

    manager.on('attach', _.partial(emit, 'shell.attach'));
    manager.on('detach', _.partial(emit, 'shell.detach'));

    // Register
    register(null, {
        "shells": manager
    });
}

// Exports
module.exports = setup;
