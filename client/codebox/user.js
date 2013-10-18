define([
    "Underscore",
    "hr/hr"
], function(_, hr) {
    var logging = hr.Logger.addNamespace("user");

    var User = hr.Model.extend({
        defaults: {
            "name": null,
            "userId": null,
            "email": null,
            "image": null
        }
    });

    return User;
});