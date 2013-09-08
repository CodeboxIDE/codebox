// Requires
var Q = require('q');
var _ = require('underscore');

var path = require('path');

var wireFriendly = require('../utils').wireFriendly;


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
HttpRPCManager.prototype.methodHandler = function(method, methodUrl, opts) {
    return function _methodHandler(req, res, next) {
        // Extract arguments
        var args = _.clone(req.query);

        // Meta stuff
        var meta = {
            req: req,
            res: res,
            user: (opts.auth ? req.user : null)
        };

        // Do auth
        if(opts.auth && !(meta.user)) {
            // Unauthorized
            return res.send(500, {
                ok: false,
                data: {},
                error: "Could not run RPC request because user has not authenticated",
                method: methodUrl,
            });
        }

        return method(args, meta)
        .then(function(data) {
            res.send(200, {
                ok: true,
                data: wireFriendly(data),
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

            console.error(err.stack);
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


HttpRPCManager.prototype.register = function(serviceName, service, opts) {
    var that = this;

    // Get the list of the service's methods
    var methods = _.methods(service);

    var options = _.extend({
        auth: true,
    }, opts || {});

    // Register all methods
    methods.forEach(function(method) {
        // Full URL of method
        var url = that.urlFor(serviceName, method);

        // Real method
        var methodFunc = service[method];

        // Express handler
        var handler = that.methodHandler(methodFunc, url, options);

        // Register it
        that._registerHandler(url, handler);
    });

};


// Exports
exports.HttpRPCManager = HttpRPCManager;
