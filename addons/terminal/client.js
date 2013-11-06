define([
    "views/tab"
], function(TerminalTab) {
    var commands = require("core/commands");
    var tabs = require("utils/tabs");

    // Add opening command
    commands.register("terminal.open", {
        title: "Terminal",
        icon: "terminal"
    }, function() {
        tabs.open(TerminalTab);
    });
});