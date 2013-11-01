define([
    "Underscore",
    "hr/hr",
    "utils/gravatar",
    "core/api"
], function(_, hr, gravatar, api) {
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

        // Return url for avatar
        avatar: function(options) {
            return gravatar.get(this.get("email"), options);
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