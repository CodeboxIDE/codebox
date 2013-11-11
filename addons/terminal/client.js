define([
    "views/tab"
], function(TerminalTab) {
    var commands = codebox.require("core/commands");
    var tabs = codebox.require("utils/tabs");

    // Add opening command
    commands.register("terminal.open", {
        title: "Terminal",
        icon: "terminal"
    }, function() {
        tabs.open(TerminalTab);
    });
});