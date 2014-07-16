// Requires
var http = require('http');
var express = require('express');
var _ = require('lodash');

function setup(options, imports, register) {
    var workspace = imports.workspace;
    var logger = imports.logger.namespace("web");

    // Expres app
    var app = express();

    if (options.dev) {
        app.use(function(req, res, next) {
            logger.log("["+req.method+"]", req.url);
            next();
        });
    }

    // Apply middlewares
    app.use(express.cookieParser());
    app.use(express.cookieSession({
        'key': ['sess', workspace.id].join('.'),
        'secret': workspace.secret,
    }));



    // Get User and set it to res object
    app.use(function getUser(req, res, next) {
        var uid = req.session.userId;
        if(uid) {
            // Pause request stream
            req.pause();

            return workspace.getUser(uid)
            .then(function(user) {
                // Set user
                res.user = user;

                // Activate user
                res.user.activate();
            }, function(err) {
                res.user = null;
            }).done(function() {
                req.resume();
                next();
            });
        }
        return next();

    });

    // Client-side
    app.get('/', function(req, res, next) {
        var doRedirect = false;
        var baseToken = options.defaultToken;
        var baseEmail = options.defaultEmail;

        if (req.query.email
        && req.query.token) {
            // Auth credential: save as cookies and redirect to clean url
            baseEmail = req.query.email;
            baseToken = req.query.token;
            doRedirect = true;
        }
        if ((baseToken || baseEmail) && (!req.cookies.autoAuth || doRedirect)) {
            if (baseEmail) {
                res.cookie('email', baseEmail, { httpOnly: false });
            }

            if (baseToken) {
                res.cookie('token', baseToken, { httpOnly: false })
            }

            res.cookie('autoAuth', true, { httpOnly: false });
        }

        if (doRedirect) {
            return res.redirect("/");
        }
        return next();
    });
    app.use('/', express.static(__dirname + '/../../client/build'));

    // Router
    app.use(app.router);

    // Error handling
    app.use(function(err, req, res, next) {
        if(!err) return next();

        logger.error("Error:");
        res.send({
            'error': err.message
        }, 500);

        logger.error(err.stack);
    });

    // Block queries for unAuthenticated users
    //
    var authorizedPaths = [];
    app.all("*", function(req, res, next) {
        if(!needAuth(req.path) || res.user) {
            return next();
        }
        // Unauthorized
        return res.send(403, {
            ok: false,
            data: {},
            error: "Could not run API request because user was not authenticated",
            method: req.path,
        });
    });

    // Check if a path need auth
    var needAuth = function(path) {
        if (path == "/") return false;
        return _.find(authorizedPaths, function(authPath) {
            return path.indexOf(authPath) == 0;
        }) == null;
    };

    // Disable auth for a path
    var disableAuth = function(path) {
        logger.log("disable auth for", path);
        authorizedPaths.push(path);
    };
    disableAuth("/static");

    // Http Server
    var server = http.createServer(app);

    // Register
    register(null, {
        "server": {
            "app": app,
            "http": server,
            'disableAuth': disableAuth,
            'port': options.port,
            'hostname': options.hostname
        }
    });
}

// Exports
module.exports = setup;