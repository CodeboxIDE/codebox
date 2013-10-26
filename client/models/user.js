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
            'settings': {}
        },

        // Constructor
        initialize: function() {
            User.__super__.initialize.apply(this, arguments);
            this.codebox = this.options.codebox;

            return this;
        },

        // Save user settings
        saveSettings: function(data) {
            var that = this;
            return this.codebox.rpc("/auth/settings", data).then(function(settings) {
                that.set("settings", settings);
            });
        }
    });

    return User;
});