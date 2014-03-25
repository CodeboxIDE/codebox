define([
    "views/tab",
    "settings"
], function(DebugTab, settings) {
    var Q = codebox.require("hr/promise");
    var _ = codebox.require("hr/utils");
    var File = codebox.require("models/file");
    var toolbar = codebox.require("core/commands/toolbar");
    var dialogs = codebox.require("utils/dialogs");
    var files = codebox.require("core/files");
    var tabs = codebox.require("core/tabs");
    var box = codebox.require("core/box");
    var debugManager = codebox.require("core/debug/manager");

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

            return debugManager.open()
            .then(function(dbg) {
                return tabs.add(DebugTab, {
                    'dbg': dbg,
                    'path': file.path(),
                    'tool': settings.user.get("tool") == "auto" ? null : settings.user.get("tool"),
                    'argument': settings.user.get("argument")
                }, {
                    'type': "debug",
                    'section': "debug"
                });
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
            dialogs.alert("No file specified", "Click left on a file and select 'Debug' to open it with the debugger, it'll be saved in your settings as last debugged file.");
            return;
        }

        var f = new File();

        return f.getByPath(path)
        .then(function() {
            return filesHandler.open(f);
        }, function() {
            dialogs.alert("File not found", "File "+_.escape(path)+" doesn't exists. Click left on an another file and select 'Debug' to open it with the debugger.");
        });
    });
});