define([
    'q',
    'hr/hr'
], function (Q, hr) {
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

            return this.request("post", "rpc"+method, JSON.stringify(args), options).then(function(data) {
                if (!data.ok) return Q.reject(new Error(data.error));
                return Q(data.data);
            });
        },
    });

    var api = new Api();
    return api;
});