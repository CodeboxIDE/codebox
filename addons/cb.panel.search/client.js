define([
    "views/panel"
], function(PanelSearchView) {
    var commands = codebox.require("core/commands/toolbar");
    var app = codebox.require("core/app");
    var panels = codebox.require("core/panels");

    // Add search panel
    var panel = panels.register("search", PanelSearchView);
    
    // Add opening command
    var command = commands.register("search.open", {
        title: "Search",
        icon: "search",
        position: 0,
        shortcuts: [
            "s", "/"
        ]
    });
    panel.connectCommand(command);
});