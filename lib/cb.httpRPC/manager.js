// Requires
var Q = require('q');
var _ = require('underscore');

var path = require('path');


function HttpRPCManager(app, baseUrl) {
    if(!(this instanceof HttpRPCManager)) {
        return new HttpRPCManager(app, baseUrl);
    }

    // Bind all methods
    _.bindAll(this);

    // Base URL of rpc
    this.baseUrl = baseUrl;

    // Express
    this.app = app;

}

HttpRPCManager.prototype.urlFor = function(serviceName, methodName) {
    return path.normalize(path.join(this.baseUrl, serviceName, methodName));
};

// Build a handler to handle requests for this specific request
HttpRPCManager.prototype.methodHandler = function(method, methodUrl) {
    return function _methodHandler(req, res, next) {
        // Extract arguments
        var args = _.clone(req.query);

        return method(args)
        .then(function(data) {
            res.send(200, {
                ok: true,
                data: data,
                error: null,
                method: methodUrl,
            });
        })
        .fail(function(err) {
            // Error response
            res.send(500, {
                ok: false,
                data: {},
                error: err.message,
                method: methodUrl,
            });
        });

    };
};

HttpRPCManager.prototype._registerHandler = function(url, handler) {
    // Register to express
    this.app.post(
        // URL
        url,
        // Request handler
        handler
    );

    this.app.get(
        // URL
        url,
        // Request handler
        handler
    );
};


HttpRPCManager.prototype.register = function(serviceName, service) {
    var that = this;

    // Get the list of the service's methods
    var methods = _.methods(service);

    // Register all methods
    methods.forEach(function(method) {
        // Full URL of method
        var url = that.urlFor(serviceName, method);

        // Real method
        var methodFunc = service[method];

        // Express handler
        var handler = that.methodHandler(methodFunc, url);

        // Register it
        that._registerHandler(url, handler);
    });

};


// Exports
exports.HttpRPCManager = HttpRPCManager;
