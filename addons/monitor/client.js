define([
    "views/tab"
], function(MonitorTab) {
    var commands = require("core/commands");
    var tabs = require("utils/tabs");

    // Add opening command
    commands.register("monitor.open", {
        title: "Monitor",
        icon: "dashboard"
    }, function() {
        tabs.open(MonitorTab, {}, {
            "uniqueId": "monitor",
            "type": "monitor",
        });
    });
});