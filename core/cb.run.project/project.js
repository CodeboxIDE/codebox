// Requires
var Q = require('q');
var _ = require('underscore');

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
    // projectType => shellId
    this.projects = {
        //'php': 'project-php-2000-xyz'
    };

    // Self incrimenting unique id
    this.projectCount = 0;

    _.bindAll(this);
}

ProjectRunner.prototype.shellId = function(projectTypeId, port) {
    return [this.id, projectTypeId, port, this.projectCount++].join('-');
};

ProjectRunner.prototype.portId = function(projectTypeId) {
    return [this.id, projectTypeId].join('-');
};

ProjectRunner.prototype.runScript = function(projectType, port) {
    var self = this;

    // Id of our shell
    var shellId = this.shellId(projectType.id, port);

    // Spawn the new shell
    return this.shells.createShellCommand(
        shellId, [
            // Script itself
            projectType.runner,

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
        var portId = self.portId(projectType.id);

        // Register project
        self.projects[projectType.id] = shellId;

        // Free port on shell exit
        self.shells.shells[shellId].ps.once('exit', function() {
            self.run_ports.release(portId);
            // Delete the project
            delete self.projects[projectType.id];
        });

        // Emit event
        self.events.emit("run.project", {
            type: projectType.id
        });

        return {
            shellId: shellId,
            type: projectType.id,
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

ProjectRunner.prototype.killProject = function(projectTypeId) {
    var d = Q.defer();

    var shellId = this.projects[projectTypeId];
    var shell = shellId ? this.shells.shells[shellId] : null;
    if(!shellId || !shell) {
        return Q.reject('No project shell to kill for: '+projectTypeId);
    }

    shell.ps.once('exit', d.resolve);

    shell.ps.destroy();

    return d.promise;
};

ProjectRunner.prototype.run = function() {
    var self = this;

    // Check if project has a specific type
    return this.detect()
    .then(function(projectType) {
        if (!projectType.runner) return Q.reject('No runner for project: '+projectType.id);
        return projectType;
    })
    .then(function(projectType) {
        if(!self.projects[projectType.id]) return projectType;

        // Kill the current project to launch a new one
        return self.killProject(projectType.id)
        .then(utils.constant(projectType));
    })
    .then(function(projectType) {
        var portId = self.portId(projectType.id);

        if(self.isRunning(portId)) {
            var _port = self.run_ports.ports[portId];
            return Q.reject(new Error("Project is already running on "+self.getUrl(_port)));
        }

        // Now that we have the type, claim a port
        // then run the script
        return Q.all([
            projectType,

            // Get a new port
            self.run_ports.claim(portId)
        ])
        .spread(function(projectType, port) {
            // Run the script in a new shell and return
            // a object describing the run
            return self.runScript(projectType, port);
        });
    });
};

// Exports
exports.ProjectRunner = ProjectRunner;
