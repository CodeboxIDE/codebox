var _ = require('lodash');
var Q = require('q');
var express = require('express');
var services = require('./services');

var logger = require("./utils/logger")("rpc");

var router = express.Router();

var add = function(name, methods) {
    logger.log("add service", name, "with", _.size(methods), "methods");

    router.get("/"+name, function(req, res, next) {
        res.send({
            'service': name,
            'methods': _.keys(methods)
        });
    });

    _.each(methods, function(handler, method) {
        router.post("/"+name+"/"+method, function(req, res, next) {
            Q()
            .then(function() {
                var args = _.extend({}, req.body || {});

                return handler(args);
            })
            .then(function(data) {
                res.send({
                    result: data
                });
            })
            .fail(function(err) {
                logger.error("Error with method '"+method+"'");
                logger.exception(err, false);
                res.send(500, {
                    error: err.message || err
                })
            });
        });
    });
};

var init = function() {
    _.each(services, function(methods, service) {
        add(service, methods);
    });
};

module.exports = {
    router: router,
    service: add,
    init: init
};
