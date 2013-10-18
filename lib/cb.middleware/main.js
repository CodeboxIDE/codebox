// Requires
var _ = require('underscore');

var express = require('express');


function setup(options, imports, register) {
    // Import
    var app = imports.server.app;
    var workspace = imports.workspace;
    var logger = imports.logger.namespace("web");

    // Apply middlewares
    app.use(express.cookieParser());
    app.use(express.cookieSession({
        key: ['sess', workspace.id].join('.'),
        secret: workspace.secret,
    }));

    // Error handling
    app.use(function(err, req, res, next) {
        if(!err) return next();
        res.send({
            'error': err.message
        }, 500);
        
        logger.error(err.stack);
    });

    // Get User and set it to res object
    app.use(function getUser(req, res, next) {
        // Pause request stream
        req.pause();

        var uid = req.session.userId;
        if(uid) {
            return workspace.getUser(uid)
            .then(function(user) {
                // Set user
                res.user = user;

                // Activate user
                res.user.activate();

                next();
            })
            .fail(function(err) {
                res.user = null;
                next();
            });
        }
        return next();

    });

    // Block queries for unAuthenticated users
    //
    var AUTHORIZED_PATHS = ['/', '/api/auth/join', '/api/users/list'];
    app.use(function filterAuth(req, res, next) {
        // Resume request now
        // So our handlers can use it as a stream
        req.resume();

        if(_.contains(AUTHORIZED_PATHS, req.path) || res.user || options.disableAuth) {
            return next();
        }
        // Unauthorized
        return res.send(403, {
            ok: false,
            data: {},
            error: "Could not run API request because user has not authenticated",
            method: req.path,
        });
    });


    // Register
    register(null, {});
}

// Exports
module.exports = setup;
