define([
    "views/panel"
], function(PanelRunView) {
    var commands = codebox.require("core/commands");
    var app = codebox.require("core/app");
    var panels = codebox.require("core/panels");

    // Add search panel
    var panel = panels.register("run", PanelRunView);
    
    // Add opening command
    var command = commands.register("run.open", {
        title: "Run",
        icon: "play",
        position: 1,
        shortcuts: [
            "r"
        ]
    });
    panel.connectCommand(command);
});