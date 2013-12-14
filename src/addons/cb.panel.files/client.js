define([
    "views/panel"
], function(PanelFilesView) {
    var commands = codebox.require("core/commands");
    var app = codebox.require("core/app");
    var panels = codebox.require("core/panels");
    var files = codebox.require("core/files");
    var menu = codebox.require("core/menu");
    var box = codebox.require("core/box");

    // Add files panels
    var panel = panels.register("files", PanelFilesView);
    
    // Open files panel
    panel.connectCommand(commands.register("files.tree.open", {
        title: "Files",
        icon: "folder-o",
        position: 2,
        shortcuts: [
            "f"
        ]
    }));

    // Command new file
    menu.getById("file").menu.add([{
        'id': "file.new",
        'type': "action",
        'title': "New File",
        'shortcuts': ["ctrl+shift+N"],
        'action': function() {
            files.openNew()
        },
        'position': 0
    }, {
        'id': "folder.create",
        'type': "action",
        'title': "New Folder",
        'shortcuts': ["ctrl+shift+F"],
        'action': function() {
            box.root.actionMkdir();
        },
        'position': 0
    },
    { 'type': "divider",
      'position': 0 }]);
});