define([
    "settings"
], function(settings) {
    var File = codebox.require("models/file");
    var toolbar = codebox.require("core/commands/toolbar");
    var dialogs = codebox.require("utils/dialogs");
    var files = codebox.require("core/files");

    // Add files handler
    var filesHandler = files.addHandler("debug", {
        name: "Debug",
        valid: function(file) {
            return (!file.isDirectory());
        },
        open: function(file) {
            if (file.path() != settings.user.get("path")) {
                settings.user.set("path", file.path());
                settings.user.save();
            }

            alert("debug "+file.path());
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
        f.getByPath(path)
        .then(function() {
            filesHandler.open(f);
        });
    });
});