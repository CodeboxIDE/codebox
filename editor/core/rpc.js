var Q = require("q");
var axios = require("axios");
var Backend = require("hr.backend");

var rpc = new Backend({
    prefix: "rpc"
});

rpc.defaultMethod({
    execute: function(args, options, method) {
        return Q(axios.post("rpc/"+method, args))
        .then(function(data) {
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

module.exports = rpc;
