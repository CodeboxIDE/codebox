var Q = require("q");
var axios = require("axios");
var Backend = require("hr.backend");

var rpc = new Backend({
    prefix: "rpc"
});

rpc.defaultMethod({
    execute: function(args, options, method) {
        return Q(axios.post("rpc/"+method, args))
        .then(function(res) {
            return res.data.result || {};
        }, function(err) {
            var e = new Error(err.data.error || err);
            e.code = err.status;

            return Q.reject(e);
        });
    }
});

module.exports = rpc;
