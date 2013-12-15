define([], function() {
    var _ = codebox.require("underscore");
    var commands = codebox.require("core/commands");
    var app = codebox.require("core/app");
    var box = codebox.require("core/box");
    var menu = codebox.require("core/menu");
    var dialogs = codebox.require("utils/dialogs");
    var Command = codebox.require("models/command");

    // HTTP Ports
    var httpPorts = new Command({}, {
        'id': "run.ports.http",
        'title': "Running Ports",
        'type': "menu"
    });

    // Update running ports list
    var updatePorts = function() {
        box.procHttp().then(function(ports) {
            httpPorts.menu.reset(_.map(ports, function(proc) {
                return {
                    'title': proc.port,
                    'flags': proc.reachable ? "" : "disabled",
                    'action': function() {
                        if (proc.reachable) {
                            window.open(proc.url);
                        } else {
                            dialogs.alert("Your server is not accessible ", "Your server is not accessible externally because it is bound to 'localhost', please bind it to '0.0.0.0' instead");
                        }
                    }
                };
            }))
        });
    };

    // Run command
    var runCommand = commands.register("run.workspace", {
        title: "Run Application",
        icon: "play",
        position: 1,
        shortcuts: [
            "r"
        ]
    }, function() {
        dialogs.alert("Auto-run is not yet available", "Run your application from the terminal on port 5000 and open your applications from the list below.");
    });

    // Add menu
    menu.register("run", {
        title: "Run"
    }).menuSection([
        runCommand,
        {
            'type': "action",
            'title': "Logging Output",
            'action': function() {
                Command.run("monitor.open");
            }
        }
    ]).menuSection([
        {
            'type': "action",
            'title': "Refresh Ports",
            'action': updatePorts
        },
        httpPorts
    ]);

    updatePorts();
});