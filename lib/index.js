var Q = require('q');
var _ = require('lodash');
var path = require('path');
var express = require('express');


var packages = require('./packages');
var rpc = require('./rpc');
var workspace = require('./workspace');
var logging = require('./utils/logger');

var logger = logging("main");

var prepare = function(config) {
    return Q()
    .then(_.partial(logging.init, config))
    .then(_.partial(workspace.init, config))
    .then(_.partial(packages.init, config))
    .then(_.partial(rpc.init, config))
};

var start = function(config) {
    var app = express();

    // Static files
    app.use('/', express.static(path.resolve(__dirname, '../build')));
    app.use('/packages', express.static(path.resolve(__dirname, '../packages')));
    app.use('/rpc', rpc.router);

    return prepare(config)
    .then(function() {
        logger.log("");
        logger.log("Application is listening on port", config.port);
        app.listen(config.port);
    });
};

module.exports = {
    start: start,
    prepare: prepare
};
