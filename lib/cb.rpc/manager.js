// Requires
var Q = require('q');
var _ = require('underscore');

var path = require('path');

var wireFriendly = require('../utils').wireFriendly;


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
    return path.normalize(path.join(this.baseUrl, serviceName, methodName));
};

// Build a handler to handle requests for this specific request
HttpRPCManager.prototype.methodHandler = function(method, methodUrl, opts) {
    return function _methodHandler(req, res, next) {
        // Extract arguments
        var args = _.clone(req.query);

        // Meta stuff
        var meta = {
            'req': req,
            'res': res,
            'user': res.user
        };

        return method(args, meta).then(function(data) {
            res.send(200, {
                'ok': true,
                'data': wireFriendly(data),
                'method': methodUrl,
            });
        }, function(err) {
            // Error response
            res.send(500, {
                'ok': false,
                'data': {},
                'error': err.message,
                'method': methodUrl,
            });

            logger.exception(err, false);
        });
    };
};

HttpRPCManager.prototype._registerHandler = function(url, handler, options) {
    // Disable auth
    if (options.auth == false) {
        this.server.disableAuth(url);
    }

    // Register to express
    this.app.post(url, handler);

    this.app.get(url, handler);
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
