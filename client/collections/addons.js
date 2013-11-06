define([
    "q",
    "underscore",
    "hr/hr",
    "core/api",
    "models/addon"
], function(Q, _, hr, api, Addon) {
    var Addons = hr.Collection.extend({
        model: Addon,
        defaults: _.defaults({
            loader: "getInstalled",
            loaderArgs: [],
        }, hr.Collection.prototype.defaults),
        
        // Get installed addons
        getInstalled: function(options) {
            var that = this;
            
            options = _.defaults(options || {}, {});

            return api.rpc("/addons/list").then(function(data) {
                that.add(_.values(data));
            });
        },

        // Check addons is installed
        isInstalled: function(name) {
            return this.find(function(addon) {
                return addon.get("name") == name;
            }) != null;
        },

        // Check addons is a default addon
        isDefault: function(name) {
            var m = this.find(function(addon) {
                return addon.get("name") == name;
            });
            if (m == null) return false;
            return m.get("default");
        },

        // Install an addon
        install: function(git) {
            var that = this;

            return api.rpc("/addons/install", {
                'git': git
            }).then(function(data) {
                that.add(data);
            });
        },
        uninstall: function(name) {
            var that = this;

            return api.rpc("/addons/uninstall", {
                'name': name
            }).then(function() {
                that.reset([]);
                that.getInstalled();
            });
        },

        // Load all this addons collection
        loadAll: function() {
            return Q.allSettled(this.map(function(addon) {
                return addon.load();
            }));
        }
    });

    return Addons;
});