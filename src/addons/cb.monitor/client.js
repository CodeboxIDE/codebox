define([
    "views/tab"
], function(MonitorTab) {
    var commands = codebox.require("core/commands");
    var tabs = codebox.require("core/tabs");
    var menu = codebox.require("core/menu");

    // Add opening command
    var command = commands.register("monitor.open", {
        title: "Monitor",
        icon: "dashboard",
        visible: false
    }, function() {
        tabs.add(MonitorTab, {}, {
            "uniqueId": "monitor",
            "type": "monitor",
            'section': "terminals"
        });
    });
    menu.getById("file").menu.add(command);
});