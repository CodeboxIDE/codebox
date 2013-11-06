define([
    "config",
    "utils/base64",
    "models/addon"
], function(config, base64, Addon) {
    var Q = require("q");
    var hr = require("hr/hr");
    var _ = require("underscore");
    var addons = require("core/addons");

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

            return hr.Requests.getJSON(config.indexUrl).then(function(index) {
                window.toDecode = index.content;
                that._index = JSON.parse(base64.decode(index.content));
                hr.Cache.set("addons", "index", that._index, 60*60);

                return Q(that._index);
            });
        },
        
        // Addon from indexes
        getFromIndex: function(options, filter) {
            var that = this;
            options = _.defaults({}, options || {}, this.options);

            return this.getIndex().then(function(index) {
                var results = filter(index);

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