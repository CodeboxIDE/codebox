require([
    "hr/utils",
    "hr/dom",
    "hr/promise",
    "hr/hr",
    "hr/args",
    "resources/init",
    "core/application",
    "utils/dialogs"
], function(_, $, Q, hr, args, resources, app) {

    window.codebox = {
        require: require
    };


    resources()
    .then(app.run.bind(app))
    //.then(app.router.start.bind(app.router));
});
