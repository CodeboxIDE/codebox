var Q = require('q');
var path = require('path');
var express = require('express');


var packages = require('./packages');
var rpc = require('./rpc');
var logger = require("./utils/logger")("main");


var start = function(config) {
    var app = express();

    // Static files
    app.use('/', express.static(path.resolve(__dirname, '../build')));
    app.use('/packages', express.static(path.resolve(__dirname, '../packages')));
    app.use('/rpc', rpc.router);

    return Q()
    .then(packages.init)
    .then(rpc.init)
    .then(function() {
        logger.log("");
        logger.log("Application is listening on port", config.port);
        app.listen(config.port);
    });
};

module.exports = {
    start: start
};
