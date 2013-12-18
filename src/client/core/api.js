define([
    'q',
    'hr/hr',
    'core/offline/manager',
    'core/offline/backend'
], function (Q, hr, offline, offlineBackend) {
    var logging = hr.Logger.addNamespace("api");

    var Api = hr.Class.extend({
        /*
         *  Execute a request
         *
         *  @param mode : mode "get", "post", "getJSON", "put", "delete"
         *  @param method : url for the request
         *  @args : args for the request
         */
        request: function(mode, method, args, options) {
            return hr.Requests[mode](method, args, options);
        },

        /*
         *  Execute a rpc request
         *
         *  @param method to call
         *  @args : args for the request
         */
        rpc: function(method, args, options) {
            options = _.defaults({}, options || {}, {
                dataType: "json",
                options: {
                    'headers': {
                        'Content-type': 'application/json'
                    }
                }
            });

            // Is offline
            if (!offline.isConnected()) {
                if (offlineBackend[method]) {
                    logging.log("use fallback offline for method", method)
                    return Q(offlineBackend[method].fallback(args, options));
                } else {
                    logging.error("no fallback for", method);
                    return Q.reject(new Error("No offline fallback for this api rpc method: "+method));
                }
            }

            return this.request("post", "rpc"+method, JSON.stringify(args), options).then(function(data) {
                if (!data.ok) return Q.reject(new Error(data.error));

                // Signal to offline backend
                if (offlineBackend[method] && offlineBackend[method].trigger) {
                    offlineBackend[method].trigger(args, data.data, options);
                }

                // Return result
                return Q(data.data);
            }, function(err) {
                try {
                    var errContent = JSON.parse(err.httpRes);
                    return Q.reject(new Error(errContent.error || err.message));
                } catch(e) {
                    return Q.reject(err);
                }
            });
        },
    });

    var api = new Api();
    return api;
});