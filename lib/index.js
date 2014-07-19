var Q = require('q');
var _ = require('lodash');
var path = require('path');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

var events = require('./events');
var packages = require('./packages');
var rpc = require('./rpc');
var workspace = require('./workspace');
var socket = require('./socket');
var logging = require('./utils/logger');

var logger = logging("main");

var prepare = function(config) {
    return Q()
    .then(_.partial(logging.init, config))
    .then(_.partial(events.init, config))
    .then(_.partial(workspace.init, config))
    .then(_.partial(rpc.init, config))
    .then(_.partial(packages.init, config))
};

var start = function(config) {
    var app = express();
    var server = http.createServer(app);

    // Static files
    app.use(bodyParser());
    app.use('/', express.static(path.resolve(__dirname, '../build')));
    app.use('/packages', express.static(path.resolve(__dirname, '../packages')));
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
