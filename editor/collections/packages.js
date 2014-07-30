define([
    "hr/hr",
    "hr/utils",
    "hr/promise",
    "models/package",
    "core/rpc"
], function(hr, _, Q, Package, rpc) {
    var Packages = hr.Collection.extend({
        model: Package,

        listAll: function() {
            return rpc.execute("packages/list")
            .then(this.reset.bind(this));
        },

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

    return Packages;
});