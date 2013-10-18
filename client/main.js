require([
    "Underscore",
    "hr/hr",
    "hr/args",

    "views/views",
    "resources/resources"
], function(_, hr, args) {
    // Configure hr
    hr.configure(args);

    // Define base application
    var Application = hr.Application.extend({
        name: "Hello",
        template: "main.html",
        metas: {
            "description": "Base application using HappyRhino."
        },
        links: {
            "icon": hr.Urls.static("images/favicon.png")
        },
        events: {}
    });

    var app = new Application();
    app.run();
});