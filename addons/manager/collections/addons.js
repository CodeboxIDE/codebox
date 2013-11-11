define([
    "models/addon"
], function(Addon) {
    var Q = codebox.require("q");
    var hr = codebox.require("hr/hr");
    var _ = codebox.require("underscore");
    var user = codebox.require("core/user");
    var addons = codebox.require("core/addons");

    var Addons = hr.Collection.extend({
        model: Addon,
        defaults: _.defaults({
            loader: "allIndex",
            loaderArgs: [],
            startIndex: 0,
            limit: 10
        }, hr.Collection.prototype.defaults),

        // Get index
        getIndex: function() {
            var that = this;

            this._index = hr.Cache.get("addons", "index");
            if (this._index) {
                return Q(this._index);
            }

            return hr.Requests.getJSON(user.settings("manager").get("registry")+"/api/addons?limit=1000&callback=?").then(function(index) {
                that._index = index;
                hr.Cache.set("addons", user.settings("manager").get("registry"), that._index, 60*60);

                return Q(that._index);
            });
        },
        
        // Addon from indexes
        getFromIndex: function(options, filter) {
            var that = this;
            options = _.defaults({}, options || {}, this.options);

            return this.getIndex().then(function(index) {
                var results = filter(index.addons);

                that.add({
                    'list': results.slice(options.startIndex, options.startIndex+options.limit),
                    'n': _.size(results)
                });

                return Q(results);
            });
        },

        // Get index
        allIndex: function(options) {
            return this.getFromIndex(options, _.identity);
        },

        // Return themes
        allThemes: function(options) {
            return this.getFromIndex(options, function(index) {
                return _.filter(index, function(addon) {
                    return addon.name.indexOf("theme-") === 0;
                });
            });
        },

        // Search in index
        searchIndex: function(query, options) {
            query = query.toLowerCase();
            return this.getFromIndex(options, function(index) {

                return _.filter(index, function(addon) {
                    var text = [
                        addon.name,
                        addon["package"].description,
                        addon["package"].author,
                        addon["package"].title
                    ].join(" ").toLowerCase();
                    return text.search(query) >= 0;
                });
            });
        },

        // Return installed addons
        allInstalled: function(options) {
            return this.getFromIndex(options, function(index) {
                return _.filter(index, function(addon) {
                    return addons.isInstalled(addon.name);
                });
            });
        },

        // Return non installed addons
        allAvailable: function(options) {
            return this.getFromIndex(options, function(index) {
                return _.filter(index, function(addon) {
                    return !addons.isInstalled(addon.name);
                });
            });
        }
    });

    return Addons;
});