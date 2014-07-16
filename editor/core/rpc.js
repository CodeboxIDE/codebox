define([
    "hr/hr"
], function(hr) {
    var rpc = new hr.Backend({
        prefix: "rpc"
    });

    rpc.defaultMethod({
        execute: function(args, options, method) {
            options = _.defaults({}, options || {}, {
                dataType: "json",
                options: {
                    'headers': {
                        'Content-type': 'application/json'
                    }
                }
            });

            return hr.Requests.post("rpc/"+method, JSON.stringify(args), options).then(function(data) {
                return data.result;
            }, function(err) {
                try {
                    var errContent = JSON.parse(err.httpRes);
                    var e = new Error(errContent.error || err.message);
                    e.code = errContent.code || err.status || 500;
                    return Q.reject(e);
                } catch(e) {
                    return Q.reject(err);
                }
            });
        }
    });

    return rpc;
});