// Requires
var Q = require('q');
var _ = require('lodash');
var express = require('express');

var path = require('path');


function HttpRPCManager(server, baseUrl, logger) {
    // Bind all methods
    _.bindAll(this);

    // Base URL of rpc
    this.baseUrl = baseUrl;

    // Logger
    this.logger = logger;

    // App server
    this.server = server;
    this.app = server.app;
}

HttpRPCManager.prototype.urlFor = function(serviceName, methodName) {
    return path.normalize(path.join(this.baseUrl, serviceName, methodName).replace(/_/g, '/'));
};

// Build a handler to handle requests for this specific request
HttpRPCManager.prototype.methodHandler = function(method, methodUrl, opts) {
    var that = this;

    return function _methodHandler(req, res, next) {
        // Extract arguments
        var args = _.clone(req.query);
        _.extend(args, req.body);

        // Meta stuff
        var meta = {
            'args': args,
            'req': req,
            'res': res,
            'user': res.user
        };

        return Q().then(function() {
            return method(args, meta);
        }).then(function(data) {
            res.send(200, {
                'ok': true,
                'data': data,
                'method': methodUrl,
            });
        }, function(err) {
            that.logger.exception(err, false);

            // Error response
            res.send(500, {
                'ok': false,
                'error': err.message || err,
                'code': err.code || 500,
                'method': methodUrl,
            });
        });
    };
};

HttpRPCManager.prototype._registerHandler = function(url, handler, options) {
    // Disable auth
    if (options.auth == false) {
        this.server.disableAuth(url);
    }

    // Register to express
    this.app.post(url, express.bodyParser(), handler);
    this.app.get(url, express.bodyParser(), handler);
};


HttpRPCManager.prototype.register = function(serviceName, service, opts) {
    var that = this;

    // Get the list of the service's methods
    var methods = _.methods(service);

    var options = _.defaults({}, opts || {}, {

    });

    that.logger.log("register service", serviceName);

    // Register all methods
    methods.forEach(function(method) {
        if (method.length == 0 || method[0] == '_') {
            return;
        }

        // Full URL of method
        var url = that.urlFor(serviceName, method);

        // Real method
        var methodFunc = service[method];

        // Express handler
        var handler = that.methodHandler(methodFunc, url, options);

        // Log
        that.logger.log("add method", method, "to", serviceName);

        // Register it
        that._registerHandler(url, handler, options);
    });

};


// Exports
exports.HttpRPCManager = HttpRPCManager;
