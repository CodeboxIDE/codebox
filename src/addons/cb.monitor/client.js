define([
    "views/tab"
], function(MonitorTab) {
    var commands = codebox.require("core/commands/toolbar");
    var tabs = codebox.require("core/tabs");
    var menu = codebox.require("core/commands/menu");

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

    // Add the command to file/tools menu
    menu.getById("file").menu.add(command);
    menu.getById("tools").menu.add(command);
});