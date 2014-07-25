define([
    "hr/hr"
], function(hr) {
    var logging = hr.Logger.addNamespace("package");

    var Package = hr.Model.extend({
        defaults: {
            name: null
        },
        idAttribute: "name",

        /*
         * Return base url for the addon
         */
        url: function() {
            var basePath = window.location.pathname;
            basePath = basePath.substring(0, basePath.lastIndexOf('/')+1);
            return basePath+"packages/"+this.get("name");
        },

        /**
         * Load the addon
         */
        load: function(config, imports) {
            var context, main, pkgRequireConfig, pkgRequire, that = this
            var d = Q.defer();

            if (!this.get("main")) return Q();

            logging.log("Load", this.get("name"));
            context = "package."+this.get("name");
            main = this.get("main", "index");

            // Require config
            pkgRequireConfig = {
                'context': context,
                'baseUrl': this.url(),
                'waitSeconds': 200,
                'paths': {},
                'map': {
                    '*': {
                        'css': 'require-tools/css/css',
                        'less': 'require-tools/less/less',
                        'text': 'require-tools/text/text'
                    }
                }
            };
            pkgRequireConfig.paths[main] = "pkg-build";

            // Require context
            pkgRequire = require.config(pkgRequireConfig);

            // Load main module
            pkgRequire([main], function(globals) {
                d.resolve()
            }, function(err) {
                logging.error(err);
                d.resolve(err);
            });

            return d.promise.timeout(5000, "This addon took to long to load (> 5seconds)");
        },

        /**
         * Return version as a number
         */
        version: function() {
            return parseInt(this.get("version").replace(/\./g,""));
        }
    });

    return Package;
});