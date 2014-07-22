var Q = require('q');
var _ = require('lodash');
var path = require('path');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

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

var start = function(config) {
    var app = express();
    var server = http.createServer(app);

    app.use(bodyParser());
    app.use(cookieParser());

    // Static files
    app.use('/', express.static(path.resolve(__dirname, '../build')));
    app.use('/packages', express.static(path.resolve(__dirname, '../packages')));

    // Auth
    // todo: add session
    app.use(session({ secret: config.secret || "codebox-secret" }));
    app.all("/auth", function(req, res, next) {
        var args = _.extend({}, req.query, req.body);
        return users.auth(args.email, args.token, req)
        .then(function() {
            res.redirect("/");
        })
        .fail(next);
    });
    app.use(function(req, res, next) {
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
