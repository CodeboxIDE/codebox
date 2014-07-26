define([
    "hr/hr",
    "hr/utils",
    "hr/promise",
    "models/user",
    "core/rpc"
], function(hr, _, Q, User, rpc) {
    var logging = hr.Logger.addNamespace("users");

    var Users = hr.Collection.extend({
        model: User,

        listAll: function() {
            return rpc.execute("users/list")
            .then(this.reset.bind(this));
        },
    });

    return Users;
});