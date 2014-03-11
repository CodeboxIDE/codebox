define([
    "views/tab",
    "settings"
], function(DebugTab, settings) {
    var File = codebox.require("models/file");
    var toolbar = codebox.require("core/commands/toolbar");
    var dialogs = codebox.require("utils/dialogs");
    var files = codebox.require("core/files");
    var tabs = codebox.require("core/tabs");

    // Add files handler
    var filesHandler = files.addHandler("debug", {
        icon: "bug",
        name: "Debug",
        valid: function(file) {
            return (!file.isDirectory());
        },
        open: function(file) {
            if (file.path() != settings.user.get("path")) {
                settings.user.set("path", file.path());
                settings.user.save();
            }

            // Create trminal tab
            var tab = tabs.add(DebugTab, {
                'path': file.path(),
                'tool': "pdb"
            }, {
                'type': "debug",
                'section': "debug"
            });

            // Return the tab
            return tab;
        }
    });

    // Debugging command
    toolbar.register("debug.open", {
        category: "Debug",
        title: "Debugger",
        description: "Open Debugger",
        icons: {
            'default': "bug",
        },
        offline: false,
        shortcuts: [
            "alt+d"
        ]
    }, function(path) {
        path = path || settings.user.get("path");

        if (!path) {
            dialogs.alert("No file specified", "Click left on a file and select 'Debug' to open it with debugger, it'll be saved in your settings as last debugged file.");
            return;
        }

        var f = new File();

        return f.getByPath(path)
        .then(function() {
            return filesHandler.open(f);
        });
    });
});