define([
    "views/tab"
], function(MonitorTab) {
    var commands = codebox.require("core/commands");
    var tabs = codebox.require("utils/tabs");

    // Add opening command
    commands.register("monitor.open", {
        title: "Monitor",
        icon: "dashboard",
        visible: false
    }, function() {
        tabs.open(MonitorTab, {}, {
            "uniqueId": "monitor",
            "type": "monitor",
        });
    });
});