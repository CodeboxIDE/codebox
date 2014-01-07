define([
    "underscore",
    "hr/hr",
    "utils/gravatar",
    "core/backends/rpc"
], function(_, hr, gravatar, rpc) {
    var logging = hr.Logger.addNamespace("user");

    var User = hr.Model.extend({
        defaults: {
            "name": null,
            "userId": null,
            "email": null,
            'settings': {}
        },
        idAttribute: "userId",

        // Constructor
        initialize: function() {
            User.__super__.initialize.apply(this, arguments);
            return this;
        },

        // Return url for avatar
        avatar: function(options) {
            return gravatar.get(this.get("email"), options);
        },

        // Return a settings namespace
        settings: function(namespace) {
            var that = this;
            return {
                'all': function(def) {
                    return that.get("settings."+namespace, def);
                },
                'get': function(key, def) {
                    return that.get("settings."+namespace+"."+key, def);
                },
                'set': function(key, value) {
                    return that.set("settings."+namespace+"."+key, value);
                },
                'save': function() {
                    return that.saveSettings();
                },
                'change': function(callback, context) {
                    return that.on("change:settings."+namespace, callback, context);
                }
            }
        },

        // Save user settings
        saveSettings: function(data) {
            var that = this;
            return rpc.execute("auth/settings", data).then(function(settings) {
                that.set("settings", settings);
            });
        }
    });

    return User;
});