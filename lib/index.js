var Q = require('q');
var path = require('path');
var express = require('express');


var packages = require('./packages');
var rpc = require('./rpc');


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
        app.listen(config.port);
    });
};

module.exports = {
    start: start
};
