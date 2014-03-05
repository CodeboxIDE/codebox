define([], function() {
    var _ = codebox.require("hr/utils");
    var operations = codebox.require("core/operations");
    var box = codebox.require("core/box");
    var dialogs = codebox.require("utils/dialogs");
    var alerts = codebox.require("utils/alerts");
    var Command = codebox.require("models/command");

    // HTTP Ports
    var httpPorts = Command.register("project.ports", {
        'category': "Project",
        'title': "Running Ports",
        'type': "menu",
        'offline': false,
        'search': false
    });

    // Update running ports list
    var updatePorts = function() {
        return box.procHttp().then(function(ports) {
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
            }));

            return ports;
        });
    };

    return {
        'command': httpPorts,
        'update': updatePorts
    }
});