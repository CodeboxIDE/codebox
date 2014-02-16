define([
    "hr/utils",
    "hr/hr",
    "utils/gravatar",
    'utils/loading',
    "core/backends/rpc",
    "models/command"
], function(_, hr, gravatar, loading, rpc, Command) {
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
        settings: function(namespace, options) {
            var that = this;
            options = _.defaults(options || {}, {
                prepare: true
            });

            // Prepare settings namespace
            if (options.prepare) {
                var current = that.get("settings."+namespace);
                if (!current) that.set("settings."+namespace, {});
            }

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
                'change': function(callback, context, keys) {
                    var events = [];
                    keys = keys || [];
                    if (_.size(keys)) {
                        events = _.map(keys, function (key) {
                            return "change:settings."+namespace+"."+key;
                        });
                    } else {
                        events.push("change:settings."+namespace);
                    }
                    return that.on(events.join(" "), callback, context);
                },
                open: function() {
                    Command.run("settings", namespace);
                }
            }
        },

        // Save user settings
        saveSettings: function(data) {
            var that = this;
            data = data || this.get("settings");
            return loading.show(rpc.execute("auth/settings", data).then(function(settings) {
                that.set("settings", settings);
            }));
        }
    });

    return User;
});