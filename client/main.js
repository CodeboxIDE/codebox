require([
    "Underscore",
    "hr/hr",
    "hr/args",
    "session",
    "config",
    'views/views',
    'resources/resources',
], function(_, hr, args, session, config) {
    // Configure hr
    hr.configure(args);

    // Extend template context
    hr.Template.extendContext({
        'app': {
            'config': config
        }
    });

    // Define base application
    var Application = hr.Application.extend({
        name: "Codebox",
        template: "main.html",
        metas: {
            "description": "Cloud IDE on a box."
        },
        links: {
            "icon": hr.Urls.static("images/favicon.png")
        }
    });

    // Start session
    session.start().then(function() {
        // Start application
        var app = new Application();
        app.run();
    }, function() {
        alert("Error starting session");
    });
});