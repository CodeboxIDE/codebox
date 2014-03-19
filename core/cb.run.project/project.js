// Requires
var Q = require('q');
var _ = require('lodash');

var path = require('path');

var utils = require('../utils');


function ProjectRunner(events, workspace, shells, run_ports, project, urlPattern) {
    // Id for port allocation and stuff
    this.id = 'project';

    this.events = events;
    this.workspace = workspace;

    this.shells = shells;

    this.run_ports = run_ports;
    this.project = project;

    this.urlPattern = urlPattern;

    // Map
    // runnerId => shellId
    this.projects = {
        //'php:run': 'project-php-2000-xyz'
    };

    // Self incrimenting unique id
    this.projectCount = 0;

    _.bindAll(this);
}

ProjectRunner.prototype.shellId = function(runnerId, port) {
    return [this.id, runnerId, port, this.projectCount++].join('-');
};

ProjectRunner.prototype.portId = function(runnerId) {
    return [this.id, runnerId].join('-');
};

ProjectRunner.prototype.runScript = function(runner, port) {
    var self = this;

    // Id of our shell
    var shellId = this.shellId(runner.id, port);

    // Spawn the new shell
    return this.shells.createShellCommand(
        shellId, [
            '/bin/bash',

            // Script itself
            runner.script,

            // Path to project folder
            this.workspace.root,

            // Port allocated/claimed
            port
        ], {
        cwd: this.workspace.root,
        env: _.defaults({
            PORT: port,
            HTTP_PORT: port
        }, process.env)
    }).then(function(shell) {
        // Id of our harbor port (to release)
        var portId = self.portId(runner.id);

        // Register project
        self.projects[runner.id] = shellId;

        // Free port on shell exit
        self.shells.shells[shellId].ps.once('exit', function() {
            self.run_ports.release(portId);
            // Delete the project
            delete self.projects[runner.id];
        });

        // Emit event
        self.events.emit("run.project", {
            type: runner.id
        });

        return {
            id: runner.id,
            name: runner.name,
            shellId: shellId,
            type: runner.type,
            port: port,
            url: self.getUrl(port)
        };
    });
};

ProjectRunner.prototype.detect = function() {
    return this.project.detect();
};

ProjectRunner.prototype.isRunning = function(portId) {
    return _.has(this.run_ports.ports, portId);
};

ProjectRunner.prototype.getUrl = function(port) {
    return this.urlPattern.replace("%d", port);
};

ProjectRunner.prototype.killProject = function(runnerId) {
    var d = Q.defer();

    var shellId = this.projects[runnerId];
    var shell = shellId ? this.shells.shells[shellId] : null;
    if(!shellId || !shell) {
        return Q.reject('No project shell to kill for: '+runnerId);
    }

    shell.ps.once('exit', d.resolve);

    shell.ps.destroy();

    return d.promise;
};

ProjectRunner.prototype.run = function(options) {
    var self = this;
    var runner = null;

    // Check if project has a specific type
    return this.detect()
    .then(function(projectType) {
        runner = projectType.getRunner(_.extend({}, options, {
            pick: true
        }));
        if (!runner) return Q.reject(new Error('No runner of type "'+(options.type || "default")+'" for project type: '+projectType.id));
        return runner;
    })
    .then(function(runner) {
        if(!self.projects[runner.id]) return runner;

        // Kill the current project to launch a new one
        return self.killProject(runner.id)
        .then(utils.constant(runner));
    })
    .then(function(runner) {
        var portId = self.portId(runner.id);

        if(self.isRunning(portId)) {
            var _port = self.run_ports.ports[portId];
            return Q.reject(new Error("Project is already running on "+self.getUrl(_port)));
        }

        // Now that we have the type, claim a port
        // then run the script
        return Q.all([
            runner,

            // Get a new port
            self.run_ports.claim(portId)
        ])
        .spread(function(runner, port) {
            // Run the script in a new shell and return
            // a object describing the run
            return self.runScript(runner, port);
        });
    });
};

// Exports
exports.ProjectRunner = ProjectRunner;
