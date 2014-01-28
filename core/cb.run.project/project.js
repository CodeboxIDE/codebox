// Requires
var Q = require('q');
var _ = require('underscore');

var path = require('path');

var utils = require('../utils');


function ProjectRunner(events, workspace, shells, run_ports, project_detect, urlPattern) {
    // Id for port allocation and stuff
    this.id = 'project';

    this.events = events;
    this.workspace = workspace;

    this.shells = shells;

    this.run_ports = run_ports;
    this.project_detect = project_detect;

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

ProjectRunner.prototype.scriptPath = function(projectType) {
    return path.resolve(__dirname, 'scripts', projectType + '.sh');
};

ProjectRunner.prototype.shellId = function(projectType, port) {
    return [this.id, projectType, port, this.projectCount++].join('-');
};

ProjectRunner.prototype.portId = function(projectType) {
    return [this.id, projectType].join('-');
};

ProjectRunner.prototype.runScript = function(projectType, port) {
    var self = this;

    // Id of our shell
    var shellId = this.shellId(projectType, port);

    // Spawn the new shell
    return this.shells.createShellCommand(
        shellId, [
            // Script itself
            this.scriptPath(projectType),

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
        var portId = self.portId(projectType);

        // Register project
        self.projects[projectType] = shellId;

        // Free port on shell exit
        self.shells.shells[shellId].ps.once('exit', function() {
            self.run_ports.release(portId);
            // Delete the project
            delete self.projects[projectType];
        });

        // Emit event
        self.events.emit("run.project", {
            type: projectType
        });

        return {
            shellId: shellId,
            type: projectType,
            port: port,
            url: self.getUrl(port)
        };
    });
};

ProjectRunner.prototype.detect = function() {
    return this.project_detect.detect(this.workspace.root);
};

ProjectRunner.prototype.isRunning = function(portId) {
    return _.has(this.run_ports.ports, portId);
};

ProjectRunner.prototype.getUrl = function(port) {
    return this.urlPattern.replace("%d", port);
};

ProjectRunner.prototype.killProject = function(projectType) {
    var d = Q.defer();

    var shellId = this.projects[projectType];
    var shell = shellId ? this.shells.shells[shellId] : null;
    if(!shellId || !shell) {
        return Q.reject('No project shell to kill for: '+projectType);
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
        if(!projectType) {
            return Q.reject(new Error("The project has no supported type"));
        }
        return projectType;
    })
    .then(function(projectType) {
        if(!self.projects[projectType]) return projectType;

        // Kill the current project to launch a new one
        return self.killProject(projectType)
        .then(utils.constant(projectType));
    })
    .then(function(projectType) {
        var portId = self.portId(projectType);

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
