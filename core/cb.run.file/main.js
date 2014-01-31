// Requires
var Q = require('q');
var _ = require('lodash');

var path = require('path');

var commands = require('./commands.json');


function runCommand(ext, filename) {
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

function fileRun(events, shells, filename) {
    // Extract extension from filename (no '.')
    var ext = path.extname(filename).replace('.', '').toLowerCase();

    var _shellId = shellId(filename);
    var command = runCommand(ext, filename);

    if (!command) {
        return Q.reject(new Error('No command found to run this file'));
    }

    if(_.has(shells.shells, shellId)) {
        return Q.reject(new Error('Command is already running'));
    }

    // Create process
    return shells.createShellCommand(_shellId, command).then(function() {
        // Emit event
        events.emit("run.file", {
            ext: ext
        });

        return Q({
            shellId: _shellId,
            command: command
        });
    });
}


function setup(options, imports, register) {
    var workspace = imports.workspace;
    var shells = imports.shells;
    var events = imports.events;

    register(null, {
        "run_file": {
            command: runCommand,
            run: _.partial(fileRun, events, shells)
        }
    });
}

// Exports
module.exports = setup;