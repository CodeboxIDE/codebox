define([
    'ports'
], function(ports) {
    var _ = codebox.require("hr/utils");
    var commands = codebox.require("core/commands/toolbar");
    var operations = codebox.require("core/operations");
    var box = codebox.require("core/box");
    var dialogs = codebox.require("utils/dialogs");
    var alerts = codebox.require("utils/alerts");
    var Command = codebox.require("models/command");

    // Currently running terminal
    var runningTerm = undefined;

    // Map type -> icon
    var typeIcons = {
        'run': "fa-play",
        'build': "fa-cog fa-spin",
        'clean': "fa-eraser"
    };

    // Run command
    var runCommand = commands.register("project.run", {
        category: "Project",
        title: "Run",
        icons: {
            'default': "play",
        },
        offline: false,
        position: 1,
        shortcuts: [
            "alt+r"
        ]
    }, function(options) {
        options = options || {};

        if (runningTerm !== undefined) {
            if (runningTerm != null) runningTerm.closeTab();
            return;
        }

        setRunTerminal(null);

        // Run
        return box.run(options)
        .then(function(runInfo) {
            var op = operations.start("project.run."+runInfo.shellId, null, {
                'title': runInfo.name+" running on port "+runInfo.port,
                'icons': {
                    'default': typeIcons[runInfo.type] || "play",
                },
                'action': function() {
                    // Open the url
                    window.open(runInfo.url);

                    // Check that port is still active
                    ports.update().then(function(ports) {
                        var _port = _.find(ports, function(proc) {
                            return proc.port == runInfo.port;
                        });
                        if (!_port) {
                            op.destroy();
                        }
                    });
                }
            });

            // Stop
            op.on("destroy", function() {
                setRunTerminal(undefined);
            });

            // Terminal is close: finish the operation
            runInfo.terminal.on("tab:close", function() {
                op.destroy();
            });

            // Set active runningterminal
            setRunTerminal(runInfo.terminal);

            // Update list of ports
            ports.update();
        }, function(err) {
            dialogs.alert("Error running this project", "An error occurred when trying to run this project: "+(err.message || err));
        });
    });

    var setRunTerminal = function(st) {
        runningTerm = st;
        if (runningTerm != null) {
            runCommand.set({
                'title': "Stop",
                'icons': {
                    'default': "stop"
                }
            });
        } else {
            runCommand.set({
                'title': "Run",
                'icons': {
                    'default': "play"
                }
            });
        }
    };

    setRunTerminal(undefined);

    return {
        'command': runCommand
    }
});