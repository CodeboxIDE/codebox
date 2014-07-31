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
    "core/user",
    "core/users",
    "core/settings",
    "utils/dialogs",
    "utils/menu",
    "models/file"
], function(_, $, Q, hr, args, resources, app, commands, packages, user, users, settings, dialogs, menu, File) {
    // Create the global object for packages
    window.codebox = {
        require: require,
        app: app,
        user: user,
        root: new File(),
        settings: settings
    };

    commands.register({
        id: "settings.open",
        title: "Settings: Open",
        icon: "gear",
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
    .then(codebox.user.whoami.bind(codebox.user))
    .then(codebox.root.stat.bind(codebox.root, "./"))
    .then(settings.load.bind(settings))
    .then(users.listAll.bind(users))
    .then(function() {
        return packages.loadAll()
        .fail(function(err) {
            var message = "<p>"+err.message+"</p>";
            if (err.errors) {
                message += "<ul>"+ _.map(err.errors, function(e) {
                    return "<li><b>"+_.escape(e.name)+"</b>: "+_.escape(e.error)+"</li>";
                }).join("\n")+ "</ul>";
            }

            return dialogs.alert(message, { html: true })
        });
    })
    .then(app.run.bind(app))

});
