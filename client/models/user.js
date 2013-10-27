define([
    "Underscore",
    "hr/hr",
    "core/api"
], function(_, hr, api) {
    var logging = hr.Logger.addNamespace("user");

    var User = hr.Model.extend({
        defaults: {
            "name": null,
            "userId": null,
            "email": null,
            'settings': {}
        },

        // Constructor
        initialize: function() {
            User.__super__.initialize.apply(this, arguments);
            return this;
        },

        // Save user settings
        saveSettings: function(data) {
            var that = this;
            return api.rpc("/auth/settings", data).then(function(settings) {
                that.set("settings", settings);
            });
        }
    });

    return User;
});