// Requires
var createProxy = require('./proxy').createProxy;


function setup(options, imports, register) {
    // Import
    var app = imports.server.app;
    var events = imports.events;

    // Construct
    var proxy = createProxy('/proxy');

    // Setup request handler
    process.nextTick(function() {
        app.all('/proxy/*', function(req, res) {
            // Emit to event bus
            events.emit('proxy.handling', {
                url: req.url,
                method: req.method,
            });
            // proxy request
            return proxy.handle(req, res);
        });
    });


    // Register
    register(null, {});
}

// Exports
module.exports = setup;
