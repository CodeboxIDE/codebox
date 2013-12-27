// Requires
var Q = require('q');
var _ = require('underscore');

var path = require('path');

var commands = require('./commands.json');


function runCommand(filename) {
    // Extract extension from filename (no '.')
    var ext = path.extname(filename).replace('.', '');

    // Make sure we support running this
    if(!commands[ext]) {
        return null;
    }

    // Build the command string
    return commands[ext].replace('%s', filename);
}

function shellId(filename) {
    return ['run', filename].join('-');
}

function fileRun(shells, filename) {
    var _shellId = shellId(filename);
    var command = runCommand(filename);

    if(_.has(shells.shells, shellId)) {
        return Q.fail(new Error('Command is already running'));
    }

    // Create process
    var shell = shells.createShell({
        id: _shellId,
        command: 'bash',
        arguments: [
            '-c',
            command
        ]
    });

    return Q({
        shellId: _shellId,
        command: command
    });
}


function setup(options, imports, register) {
    var workspace = imports.workspace;
    var shells = imports.shells;

    register(null, {
        "run_file": {
            command: runCommand,
            run: _.partial(fileRun, shells)
        }
    });
}

// Exports
module.exports = setup;