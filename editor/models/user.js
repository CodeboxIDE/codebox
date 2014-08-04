define([
    "hr/hr",
    "hr/utils",
    "core/rpc"
], function(hr, _, rpc) {
    var logging = hr.Logger.addNamespace("users");

    var User = hr.Model.extend({
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

    return User;
});