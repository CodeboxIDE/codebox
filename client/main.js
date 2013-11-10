require([
    "underscore",
    "hr/hr",
    "hr/args",
    "core/app",
    "core/session",
    "config",
    'views/views',
    'resources/resources',
], function(_, hr, args, app, session, config) {
    // Configure hr
    hr.configure(args);

    // Extend template context
    hr.Template.extendContext({
        'app': {
            'config': config,
        }
    });
    
    session.prepare().then(function() {
        app.run();
    });
});