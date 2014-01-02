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

    _.bindAll(this);
}

ProjectRunner.prototype.scriptPath = function(projectType) {
    return path.resolve(__dirname, 'scripts', projectType + '.sh');
};

ProjectRunner.prototype.shellId = function(projectType, port) {
    return [this.id, projectType, port].join('-');
};

ProjectRunner.prototype.portId = function(projectType) {
    return [this.id, projectType].join('-');
};

ProjectRunner.prototype.runScript = function(projectType, port) {
    var self = this;

    // Id of our shell
    var shellId = this.shellId(projectType, port);

    // Command to run after the script itself
    // this keeps the shell open
    var exitCMD = "read -p  $'####\\n# Press \\e[00;31mENTER\\e[00m to close this shell ...\\n####\\n'";

    // Spawn the new shell
    var shell = this.shells.createShellCommand(
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
    });

    // Id of our harbor port (to release)
    var portId = self.portId(projectType);

    // Free port on shell exit
    self.shells.shells[shellId].ps.once('exit', function() {
        self.run_ports.release(portId);
    });

    return {
        shellId: shellId,
        type: projectType,
        port: port,
        url: this.urlPattern.replace("%d", port)
    };
};

ProjectRunner.prototype.detect = function() {
    return this.project_detect.detect(this.workspace.root);
};

ProjectRunner.prototype.isRunning = function(portId) {
    return _.has(this.run_ports.ports, portId);
};

ProjectRunner.prototype.run = function() {
    var self = this;

    // Check if project has a specific type
    return this.detect()
    .then(function(projectType) {
        if(!projectType) {
            return Q.fail(new Error("The project has no supported type"));
        }
        return projectType;
    })
    .then(function(projectType) {
        var portId = self.portId(projectType);

        if(self.isRunning(portId)) {
            return Q.fail(new Error("Project is already running"));
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
