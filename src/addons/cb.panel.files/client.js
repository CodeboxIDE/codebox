define([
    "views/panel"
], function(PanelFilesView) {
    var commands = codebox.require("core/commands");
    var app = codebox.require("core/app");
    var panels = codebox.require("core/panels");

    // Add search panel
    var panel = panels.register("files", PanelFilesView);
    
    // Add opening command
    var command = commands.register("files.tree.open", {
        title: "Files",
        icon: "folder-o",
        position: 1
    });
    panel.connectCommand(command);
});