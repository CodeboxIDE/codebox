require([
    "hr/utils",
    "hr/dom",
    "hr/promise",
    "hr/hr",
    "hr/args",
    "resources/init",
    "core/application",
    "core/packages",
    "utils/dialogs",
    "utils/menu",
    "models/file"
], function(_, $, Q, hr, args, resources, app, packages, dialogs, menu, File) {
    // Create the global object for packages
    window.codebox = {
        require: require,
        app: app,
        root: new File()
    };

    // Start running the applications
    resources()
    .then(codebox.root.stat.bind(codebox.root))
    .then(app.run.bind(app))
    .then(packages.loadAll.bind(packages));
});
