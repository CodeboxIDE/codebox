require([
    "underscore",
    "hr/hr",
    "hr/args",
    "core/app",
    "core/session",
    'resources/resources',
], function(_, hr, args, app, session) {
    // Configure hr
    hr.configure(args);
    
    // Start the application
    session.prepare().then(function() {
        app.run();
    });
});