define([
    "settings"
], function(managerSettings) {
    var Q = codebox.require("q");
    var hr = codebox.require("hr/hr");
    var _ = codebox.require("underscore");
    var Addon = codebox.require("models/addon");
    var addons = codebox.require("core/addons");
    var Addons = codebox.require("collections/addons");
    var box = codebox.require("core/box");

    var Addons = Addons.extend({
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
            var indexKey = managerSettings.user.get("registry");

            this._index = this._index || hr.Cache.get("addons", indexKey);
            if (this._index) {
                return Q(this._index);
            }

            return hr.Requests.getJSON(box.proxyUrl(managerSettings.user.get("registry")+"/api/addons?limit=1000")).then(function(index) {
                that._index = index;
                that._index.addons = _.map(that._index.addons, function(addon) {
                    return _.extend(addon['package'], {
                        'git': addon.git
                    });
                });
                hr.Cache.set("addons", indexKey, that._index, 60*60);

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

        // Search in index
        searchIndex: function(query, options) {
            query = query.toLowerCase();
            return this.getFromIndex(options, function(index) {

                return _.filter(index, function(addon) {
                    var text = [
                        addon.name,
                        addon.description,
                        addon.author,
                        addon.title
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
            this.reset(addons.models);
        },

        // Return defaults addons
        allDefaults: function(options) {
            this.reset(addons.filter(function(model) {
                return addons.isDefault(model.get("name"));
            }));
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