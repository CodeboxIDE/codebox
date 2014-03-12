define([
    "views/tab",
    "settings"
], function(DebugTab, settings) {
    var Q = codebox.require("hr/promise");
    var File = codebox.require("models/file");
    var toolbar = codebox.require("core/commands/toolbar");
    var dialogs = codebox.require("utils/dialogs");
    var files = codebox.require("core/files");
    var tabs = codebox.require("core/tabs");
    var box = codebox.require("core/box");

    // Current debugger tab
    var debugTab = null;

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

            return Q()
            .then(function() {
                if (debugTab) {
                    return dialogs.confirm("Do you wan to close current debugger?",
                    "There is already a debugger running, are you sure you want to close it for opening a new one.")
                    .then(function() {
                        return debugTab.closeTab();
                    });
                }
                return Q();
            })
            .then(function() {
                // Create debug tab
                debugTab = tabs.add(DebugTab, {
                    'path': file.path(),
                    'tool': settings.user.get("tool") == "auto" ? null : settings.user.get("tool"),
                    'argument': settings.user.get("argument")
                }, {
                    'type': "debug",
                    'section': "debug"
                });
                debugTab.on("tab:close", function() {
                    debugTab = null;
                });

                // Return the tab
                return debugTab;
            });
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