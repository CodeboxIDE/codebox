// Requires
var express = require('express');


function setup(options, imports, register) {
    // Import
    var app = imports.server.app;
    var workspace = imports.workspace;

    // Apply middlewares
    app.use(express.cookieParser());
    app.use(express.cookieSession({
        key: ['sess', workspace.id].join('.'),
        secret: workspace.secret,
    }));
    app.use(function(req, res, next) {
        var uid = req.session.userId;
        if(uid) {
            return workspace.getUser(uid)
            .then(function(user) {
                // Set user
                req.user = user;
                next();
            })
            .fail(next);
        }
        return next();

    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
