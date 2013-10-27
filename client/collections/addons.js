define([
    "Underscore",
    "hr/hr",
    "core/api",
    "models/addon"
], function(_, hr, api, Addon) {
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

            return api.rpc("/addons/list").done(function(data) {
                that.add(_.values(data));
            });
        }
    });

    return Addons;
});