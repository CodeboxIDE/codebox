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
    "models/file",
    "utils/hash"
], function(_, $, Q, hr, args, resources, app, packages, dialogs, File) {

    window.codebox = {
        require: require,
        app: app,
        root: new File()
    };


    resources()
    .then(app.run.bind(app))
    .then(codebox.root.stat(""))
    .then(packages.loadAll.bind(packages))
    //.then(app.router.start.bind(app.router));
});
