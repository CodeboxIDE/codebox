var _ = require('lodash');
var Q = require('q');
var express = require('express');
var services = require('./services');

var router = express.Router();

var add = function(name, methods) {
    router.get("/"+name, function(req, res, next) {
        res.send({
            'service': name,
            'methods': _.keys(methods)
        });
    });

    _.each(methods, function(handler, method) {
        console.log("RPC method", name+"/"+method);
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
    add: add,
    init: init
};
