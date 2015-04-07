var Q = require("q");
var _ = require("hr.utils");
var Collection = require("hr.collection");
var logger = require("hr.logger")("packages");

var Package = require("../models/package");
var rpc = require("../core/rpc");


var Packages = Collection.extend({
    model: Package,

    // Get packages list from backend
    listAll: function() {
        return rpc.execute("packages/list")
        .then(this.reset.bind(this));
    },

    // Load all plugins from backend
    loadAll: function() {
        var that = this;
        var errors = [];

        return this.listAll()
        .then(function() {
            return that.reduce(function(prev, pkg) {
                errors = errors.concat(_.map(pkg.get("errors"), function(e) {
                    return {
                        'name': pkg.get("name"),
                        'error': e
                    };
                }));

                return prev.then(pkg.load.bind(pkg))
                .fail(function(err) {
                    errors.push({
                        'name': pkg.get("name"),
                        'error': err
                    });
                    return Q();
                });
            }, Q());
        })
        .then(function() {
            if (errors.length > 0) {
                var e = new Error("Error loading packages");
                e.errors = errors;
                return Q.reject(e);
            }
        });
    }
});

module.exports = Packages;
