define([
    "views/panel"
], function(PanelFilesView) {
    var Command = codebox.require("models/command");
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

    // Recents files
    var recentFiles = Command.register("file.recents", {
        'type': "menu",
        'title': "Open Recent"
    });
    files.recent.on("add remove reset", function() {
        recentFiles.menu.reset(files.recent.map(function(file) {
            var path = file.path();
            return {
                'title': file.get("name"),
                'action': function() {
                    files.open(path);
                }
            };
        }).reverse());
    });


    // Command new file
    menu.getById("file").menuSection([
        {
            'id': "file.new",
            'type': "action",
            'title': "New File",
            'shortcuts': ["ctrl+shift+N"],
            'action': function() {
                files.openNew()
            }
        }, {
            'id': "folder.create",
            'type': "action",
            'title': "New Folder",
            'shortcuts': ["ctrl+shift+F"],
            'action': function() {
                box.root.actionMkdir();
            }
        },
        recentFiles
    ], {
        position: 0
    }).menuSection([
        {
            'id': "workspace.save.zip",
            'type': "action",
            'title': "Save Project As ZIP",
            'action': function() {
                window.open("/export/zip");
            }
        }
    ]);
});