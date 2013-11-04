require([
    "Underscore",
    "hr/hr",
    "hr/args",
    "core/app",
    "config",
    'views/views',
    'resources/resources',
], function(_, hr, args, app, config) {
    // Configure hr
    hr.configure(args);

    // Extend template context
    hr.Template.extendContext({
        'app': {
            'config': config,
        }
    });
    
    app.run();
});