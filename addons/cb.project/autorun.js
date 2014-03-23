define([
    'settings',
    'ports'
], function(settings, ports) {
    var _ = codebox.require("hr/utils");
    var commands = codebox.require("core/commands/toolbar");
    var operations = codebox.require("core/operations");
    var box = codebox.require("core/box");
    var dialogs = codebox.require("utils/dialogs");
    var alerts = codebox.require("utils/alerts");
    var Command = codebox.require("models/command");

    // Currently running terminal
    // undefined -> nothing is running
    // null -> preparing the run
    // {...} _> running
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
        options = _.defaults(options || {}, {
            'ignoreErrors': false
        });

        if (runningTerm !== undefined) {
            // For stopping: Close terminal
            if (runningTerm != null) {
                runningTerm.terminal.closeTab();
            }

            return;
        }

        setRunTerminal(null);

        // Run
        return box.run({
            'id': options.id,
            'type': options.type
        })
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

            // Terminal is close: finish the operation
            runInfo.terminal.on("tab:close", function() {
                op.destroy();
                setRunTerminal(undefined);
            });

            // Set active runningterminal
            setRunTerminal(runInfo);

            // Update list of ports
            ports.update();

            // Open url if settings is set for
            if (settings.user.get("openrundialog", true)) {
                dialogs.confirm("Application is now running on port "+runInfo.port, "Open <b>"+_.escape(runInfo.url)+"</b> in a new window? (This dialog can be disabled in the settings).")
                .progress(function(diag) {
                    diag.once("close", function(result, e) {
                        if (result) window.open(runInfo.url);
                    })
                });
            }
        }, function(err) {
            setRunTerminal(undefined);
            
            if (!options.ignoreErrors) dialogs.alert("Error running this project", "An error occurred when trying to run this project: "+(err.message || err));
        });
    });

    var setRunTerminal = function(st) {
        var previous = runningTerm;
        runningTerm = st;

        // Change command state
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

        if (previous 
        && previous.type == "run"
        && runningTerm === undefined) {
            // Run stop command
            return runCommand.run({
                'type': "stop",
                'ignoreErrors': true
            });
        }
    };

    setRunTerminal(undefined);

    return {
        'command': runCommand
    }
});