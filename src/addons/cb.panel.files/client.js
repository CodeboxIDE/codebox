define([
    "views/panel"
], function(PanelFilesView) {
    var commands = codebox.require("core/commands");
    var app = codebox.require("core/app");
    var panels = codebox.require("core/panels");
    var files = codebox.require("core/files");
    var menu = codebox.require("core/menu");
    var box = codebox.require("core/box");

    // Add menu
    menu.register("files", {
        title: "File",
        position: 0
    }, [
        {
            'type': "action",
            'text': "New file",
            'action': function() {
                files.openNew()
            }
        },
        {
            'type': "action",
            'text': "New folder",
            'action': function() {
                box.root.actionMkdir();
            }
        },
        { 'type': "divider" }
    ]);

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
});