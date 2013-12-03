define([
    "views/panel"
], function(PanelFilesView) {
    var commands = codebox.require("core/commands");
    var app = codebox.require("core/app");
    var panels = codebox.require("core/panels");
    var files = codebox.require("core/files");

    // Add search panel
    var panel = panels.register("files", PanelFilesView);
    
    // Add opening command
    var command = commands.register("files.tree.open", {
        title: "Files",
        icon: "folder-o",
        position: 2,
        shortcuts: [
            "f"
        ]
    });
    panel.connectCommand(command);

    // Command new file
    commands.register("files.new", {
        title: "New file",
        icon: "file-o",
        shortcuts: [
            "mod+N"
        ],
        position: 2
    }, function(args) {
        files.openNew()
    });
});