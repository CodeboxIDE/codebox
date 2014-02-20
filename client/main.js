require([
    "hr/utils",
    "hr/hr",
    "hr/args",
    "resources/resources",
    "core/app",
    "core/session",
], function(_, hr, args, resources, app, session) {
    // Configure hr
    hr.configure(args, {
        logLevel: args.debug ? "log" : "error"
    });
    
    // Start the application
    session.prepare().then(function() {
        app.run();
    }, function(err) {
        console.error("Error when starting the application:", err);
    });
});