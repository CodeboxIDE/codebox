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
], function(_, $, Q, hr, args, resources, app, packages) {

    window.codebox = {
        require: require
    };


    resources()
    .then(app.run.bind(app))
    .then(packages.loadAll.bind(packages))
    //.then(app.router.start.bind(app.router));
});
