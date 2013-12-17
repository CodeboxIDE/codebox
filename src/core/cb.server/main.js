// Requires
var http = require('http');
var express = require('express');
var _ = require('underscore');

function setup(options, imports, register) {
    var workspace = imports.workspace;
    var logger = imports.logger.namespace("web");

    // Expres app
    var app = express();

    // Apply middlewares
    app.use(express.cookieParser());
    app.use(express.cookieSession({
        'key': ['sess', workspace.id].join('.'),
        'secret': workspace.secret,
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

    // Client-side
    app.use('/', function(req, res, next) {
        if (req.query.email
        && req.query.token) {
            // Auth credential: save as cookies and redirect to clean url
            res.cookie('email', req.query.email, { httpOnly: false });
            res.cookie('token', req.query.token, { httpOnly: false })
            return res.redirect("/");
        }
        return next();
    });
    app.use('/', express.static(__dirname + '/../../client/build'));
    app.use('/docs', express.static(__dirname + '/../../../docs'));

    // Block queries for unAuthenticated users
    //
    var authorizedPaths = [];
    app.use(function(req, res, next) {
        // Resume request now
        // So our handlers can use it as a stream
        req.resume();

        if(_.contains(authorizedPaths, req.path) || res.user) {
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

    // Disable auth for a path
    var disableAuth = function(path) {
        logger.log("disable auth for", path);
        authorizedPaths.push(path);
    };

    // Http Server
    var server = http.createServer(app);

    // Register
    register(null, {
        "server": {
            "app": app,
            "http": server,
            'disableAuth': disableAuth,
            'port': options.port,
        }
    });
}

// Exports
module.exports = setup;