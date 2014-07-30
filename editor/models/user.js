define([
    "hr/hr",
    "hr/utils"
], function(hr, _) {
    var logging = hr.Logger.addNamespace("users");

    var User = hr.Model.extend({
        defaults: {
            id: null,
            name: null,
            email: null
        }
    });

    return User;
});