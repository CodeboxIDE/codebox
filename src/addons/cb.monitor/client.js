define([
    "views/tab"
], function(MonitorTab) {
    var commands = codebox.require("core/commands");
    var tabs = codebox.require("core/tabs");

    // Add opening command
    commands.register("monitor.open", {
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
});