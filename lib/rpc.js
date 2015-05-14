var _ = require('lodash');
var Q = require('q');
var express = require('express');
var services = require('./services');

var logger = require("./utils/logger")("rpc");

var router = express.Router();

var SERVICES = {};

var add = function(name, methods) {
    logger.log("add service", name, "with", _.size(methods), "methods");

    // Add service to map
    SERVICES[name] = _.chain(methods)
    .map(function(method, methodName) {
        return [
            methodName,
            function(args, context) {
                args = args || {};
                context = context || {};
                return Q()
                .then(function() {
                    return method(args, context);
                });
            }
        ];
    })
    .object()
    .value();
};

var getService = function(name) {
    return SERVICES[name];
};

var init = function() {
    _.each(services, function(methods, service) {
        add(service, methods);
    });

    router.get("/:service", function(req, res, next) {
        var service = getService(req.params.service);
        if (!service) {
            var e = new Error("Service not found");
            e.code = 404;
            return next(e);
        }

        res.send({
            'service': req.params.service,
            'methods': _.keys(service)
        });
    });

    var handle = function(req, res, next) {
        var service = getService(req.params.service);
        if (!service) {
            var e = new Error("Service not found");
            e.code = 404;
            return next(e);
        }

        var method = service[req.params.method];
        if (!method) {
            var e = new Error("Method not found");
            e.code = 404;
            return next(e);
        }

        method(req.body || {}, {
            user: req.user,
            req: req
        })
        .then(function(data) {
            res.send({
                result: data
            });
        })
        .fail(function(err) {
            logger.error("Error with method '"+req.params.method+"'");
            logger.exception(err, false);
            res.send(500, {
                error: err.message || err,
                code: err.code || 500
            })
        });
    };

    router.post("/:service/:method", handle);
    router.put("/:service/:method", handle);
};

module.exports = {
    router: router,
    service: add,
    init: init,
    get: getService
};
