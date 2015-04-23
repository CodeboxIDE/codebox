var Q = require('q');
var _ = require('lodash');
var path = require('path');
var os = require('os');
var uuid = require('uuid');
var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var Busboy = require('busboy');

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

var _middleware = function(fn) {
    var __middleware;
    return function(req, res, next) {
        if (!__middleware) __middleware = fn();
        return __middleware.apply(this, arguments);
    };
}

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

    // Parse form data
    app.use(function(req, res, next) {
        if (
            (req.headers['content-type'] || "").indexOf('multipart/form-data') < 0
            && req.method.toLowerCase() != "put"
        ) return next();

        var files = {}, fields = {};

        var busboy = new Busboy({
            headers: req.headers
        });
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            var saveTo = path.join(os.tmpDir(), uuid.v4());
            file.pipe(fs.createWriteStream(saveTo));
            files[fieldname] = {
                filename: filename,
                path:  saveTo,
                mimetype: mimetype
            };
        });
        busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
            var pval;

            try {
                pval = JSON.parse(val);
            } catch (e) {
                pval = val;
            }

            if (fields[fieldname]) {
                if (!_.isArray(fields[fieldname])) fields[fieldname] = [fields[fieldname]];
                fields[fieldname].push(pval);
            } else {
                fields[fieldname] = pval;
            }
        });
        busboy.on('finish', function() {
            req.body = fields;
            req._body = true;
            req.files = files;

            res.on ('finish', function () {
                _.each(req.files, function(file) {
                    try { fs.unlinkSync(file.path); } catch(e) {}
                });
                req.files = {};
            });

            next();
        });
        req.pipe(busboy);
    });
    app.use(bodyParser());
    app.use(cookieParser());

    // Auth
    app.use(session({
        secret: config.secret || "codebox-secret",
        resave: false,
        saveUninitialized: true
    }));

    // Auth by query strings
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

    // Auth
    app.use(function(req, res, next) {
        if (req.session.userId) return next();

        var auth = basicAuth(req);

        // Do basic auth
        if (auth && auth.name && auth.pass) {
            users.auth(auth.name, auth.pass, req)
            .then(function(user) {
                req.user = user;
                next();
            })
            .fail(next);
        } else {
            if (config.auth.redirect) {
                console.log('no auth, redirect to', config.auth.redirect);
                res.redirect(config.auth.redirect);
            } else {
                res.header('WWW-Authenticate', 'Basic realm="codebox"');
                res.status(401);
                res.end();
            }
        }
    });
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

    // Static files
    app.use('/', express.static(path.resolve(__dirname, '../build')));


    // Download packages
    app.use('/packages', _middleware(function() {
        return express.static(config.packages.root);
    }));
    app.get('/packages.js', function(req, res, next) {
        return packages.bundle()
        .then(function(fp) {
            fs.createReadStream(fp).pipe(res);
        })
        .fail(next);
    });

    // RPC services
    app.use('/rpc', rpc.router);

    // Fs direct access
    app.use('/fs', _middleware(function() {
        return express.static(workspace.root());
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

    return prepare(_.extend(config, { run: true }))
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
