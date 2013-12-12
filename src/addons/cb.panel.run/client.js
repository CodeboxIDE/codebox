define([
    "views/panel"
], function(PanelRunView) {
    var commands = codebox.require("core/commands");
    var app = codebox.require("core/app");
    var panels = codebox.require("core/panels");
    var menu = codebox.require("core/menu");

    // Add search panel
    var panel = panels.register("run", PanelRunView);

    // Add menu
    menu.register("run", {
        title: "Run"
    }, [
        {
            'type': "action",
            'text': "Run Application",
            'command': "project.run"
        },
        { 'type': "divider" },
        {
            'type': "action",
            'text': "Logging Output",
            'command': "monitor.open"
        }
    ]);
    
    // Add opening command
    var command = commands.register("panel.run.open", {
        title: "Run",
        icon: "play",
        position: 1,
        shortcuts: [
            "r"
        ]
    });
    panel.connectCommand(command);
});