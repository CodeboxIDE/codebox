require([
    "hr/utils",
    "hr/dom",
    "hr/promise",
    "hr/hr",
    "hr/args",
    "resources/init",
    "core/application",
    "core/commands",
    "core/packages",
    "core/users",
    "core/settings",
    "utils/dialogs",
    "utils/menu",
    "models/file"
], function(_, $, Q, hr, args, resources, app, commands, packages, users, settings, dialogs, menu, File) {
    // Create the global object for packages
    window.codebox = {
        require: require,
        app: app,
        root: new File(),
        settings: settings
    };

    commands.register({
        id: "settings.open",
        title: "Settings: Open",
        shortcuts: [
            "mod+,"
        ],
        run: function(args, context) {
            return commands.run("file.open", {
                file: settings.getFile()
            });
        }
    });

    // Start running the applications
    resources()
    .then(codebox.root.stat.bind(codebox.root))
    .then(settings.load.bind(settings))
    .then(users.listAll.bind(users))
    .then(packages.loadAll.bind(packages))
    .then(app.run.bind(app));
});
