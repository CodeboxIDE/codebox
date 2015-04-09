var Q = require("q");
var _ = require("hr.utils");
var Model = require("hr.model");
var logger = require("hr.logger")("users");

var rpc = require("../core/rpc");

var User = Model.extend({
    defaults: {
        id: null,
        name: null,
        email: null,
        color: null
    },

    // Identify the logged in user
    whoami: function() {
        var that = this;

        return rpc.execute("users/whoami")
        .then(function(data) {
            return that.set(data);
        })
        .thenResolve(that);
    },
});

module.exports = User;
