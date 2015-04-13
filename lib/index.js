var Q = require('q');
var _ = require('lodash');
var path = require('path');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth-connect');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var multipart = require('connect-multiparty');

var configs = require('./configs');
var hooks = require('./hooks');
var events = require('./events');
var packages = require('./packages');
var rpc = require('./rpc');
var workspace = require('./workspace');
var users = require('./users');
var socket = require('./socket');
var logging = require('./utils/logger');

var logger = logging("main");

var prepare = function(config) {
    return Q()
    .then(_.partial(logging.init, config))
    .then(function() {
        return configs(config)
        .then(function(_cfg) {
            config = _cfg;
        });
    })
    .then(_.partial(events.init, config))
    .then(_.partial(hooks.init, config))
    .then(_.partial(workspace.init, config))
    .then(_.partial(users.init, config))
    .then(_.partial(rpc.init, config))
    .then(_.partial(packages.init, config))
};

var multipartMiddleware = multipart();
var bodyParserMiddleware = bodyParser();

var start = function(config) {
    var app = express();
    var server = http.createServer(app);

    app.use(function(req, res, next) {
        if (req.method == "PUT") {
            multipartMiddleware(req, res, next);
        } else {
            bodyParserMiddleware(req, res, next);
        }
    });
    app.use(cookieParser());

    // Auth
    app.use(session({
        secret: config.secret || "codebox-secret",
        resave: false,
        saveUninitialized: true
    }));
    app.use("/", function(req, res, next) {
        var args = _.extend({}, req.query, req.body);
        if (args.email && args.token) {
            return users.auth(args.email, args.token, req)
            .then(function() {
                res.redirect("/");
            })
            .fail(next);
        } else {
            next();
        }
    });
    app.use(function(req, res, next) {
        var doAuth = basicAuth(function(user, pass, fn){
            users.auth(user, pass)
            .then(function(user) {
                fn(null, user)
            })
            .fail(fn);
        });

        if (req.session.userId || !config.auth.basic) return next();
        doAuth(req, res, next);
    });

    // Static files
    app.use('/', express.static(path.resolve(__dirname, '../build')));
    app.use('/packages', express.static(path.resolve(__dirname, '../packages')));

    // Auth
    app.use(function(req, res, next) {
        if (req.user) {
            req.session.userId = req.user.id;
        }

        if (!req.session.userId) {
            var e = new Error("Need to be authenticated");
            e.code = 401;
            return next(e);
        } else {
            var user = users.get(req.session.userId);
            if (!user) {
                var e = new Error("You need to login again");
                e.code = 401;
                return next(e);
            } else {
                req.user = user;
                next();
            }
        }
    });

    // RPC services
    app.use('/rpc', rpc.router);

    // Fs direct access
    app.use('/fs', _.memoize(function(req, res, next) {
        return express.static(workspace.root()).apply(this, arguments);
    }));

    // Error handling
    app.use(function(req, res, next) {
        var e = new Error("Page not found");
        e.code = 404;
        next(e);
    });
    app.use(function(err, req, res, next) {
        var msg = err.message || err;
        var code = Number(err.code || 500);

        // Return error
        res.format({
            'text/plain': function(){
                res.status(code);
                res.send(msg);
            },
            'application/json': function (){
                res.status(code);
                res.send({
                    'error': msg,
                    'code': code
                });
            }
        });

        logger.error(err.stack || err);
    });

    return prepare(config)
    .then(_.partial(socket.init, server, config))
    .then(function() {
        logger.log("");
        logger.log("Application is listening on port", config.port);
        server.listen(config.port);
    });
};

module.exports = {
    start: start,
    prepare: prepare
};
