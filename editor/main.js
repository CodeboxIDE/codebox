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
    "models/file"
], function(_, $, Q, hr, args, resources, app, packages, dialogs, File) {
    // Create the global object for packages
    window.codebox = {
        require: require,
        app: app,
        root: new File()
    };

    // Start running the applications
    resources()
    .then(app.run.bind(app))
    .then(codebox.root.stat(""))
    .then(packages.loadAll.bind(packages));
});
