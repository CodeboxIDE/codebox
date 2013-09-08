// Requires
var _ = require('underscore');

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
    // Get User and set it to res object
    app.use(function getUser(req, res, next) {
        var uid = req.session.userId;
        if(uid) {
            return workspace.getUser(uid)
            .then(function(user) {
                // Set user
                res.user = user;
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
    var AUTHORIZED_PATHS = ['/', '/auth/join'];
    app.use(function filterAuth(req, res, next) {
        if(_.contains(AUTHORIZED_PATHS, req.path) || res.user) {
            return next();
        }
        // Unauthorized
        return res.send(403, {
            ok: false,
            data: {},
            error: "Could not run RPC request because user has not authenticated",
            method: req.path,
        });
    });


    // Register
    register(null, {});
}

// Exports
module.exports = setup;
