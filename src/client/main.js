require([
    "underscore",
    "hr/hr",
    "hr/args",
    "resources/resources",
    "core/app",
    "core/session",
], function(_, hr, args, resources, app, session) {
    // Configure hr
    hr.configure(args);
    
    // Start the application
    session.prepare().then(function() {
        app.run();
    }, function(err) {
        console.error("Error when starting the application:", err);
    });
});