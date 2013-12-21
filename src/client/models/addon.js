define([
    "q",
    "underscore",
    "jQuery",
    "hr/hr",

    // addons dependencies
    "core/globals"
], function(Q, _, $, hr) {
    var logging = hr.Logger.addNamespace("addon");

    var Addon = hr.Model.extend({
        defaults: {
            'name': "",
            'title': "",
            'description': "",
            'version': "0.0.1",
            'author': "",
            'client': {
                'main': "client"
            },
            'state': "notloaded"  // addons state: "notloaded", "loaded", "error"
        },

        // Return base url for the addon
        url: function() {
            return "/static/addons/"+this.get("name");
        },

        // Load the addon
        load: function(config, imports) {
            var context, main, addonRequireConfig,
            addonRequire, that = this
            var d = Q.defer();

            logging.log("Load", this.get("name"));
            context = "addon."+this.get("name");
            main = this.get("client.main", "client");

            // Require config
            addonRequireConfig = {
                'context': context,
                'baseUrl': this.url(),
                'waitSeconds': 200,
                //'urlArgs': "version="+this.get("version"),
                'paths': {
                    "require-tools": "/static/require-tools"
                },
                'map': {
                    '*': {
                        'css': 'require-tools/css/css',
                        'less': 'require-tools/less/less',
                        'text': 'require-tools/text/text'
                    }
                }
            };
            addonRequireConfig.paths[main] = "addon-built";

            // Require context
            addonRequire = require.config(addonRequireConfig);

            // Ressources
            hr.Resources.addNamespace(context+".templates", {
                loader: "http",
                base: "/addons/"+this.get("name")+"/templates"
            });

            // Register addons
            var register = function(err, globals) {
                if (err) {
                    that.set("state", "error");
                    logging.error("Error loading ", that.get("name"));
                    logging.error(err);
                    d.reject(err);
                    return;
                }
                that.set("state", "loaded");
                d.resolve(globals);
            };

            // Load main module
            addonRequire([main], function(globals) {
                if (_.isFunction(globals)) {
                    globals(config, imports, register);
                } else {
                    register(null, globals);
                }
            }, register);

            return d.promise;
        },

        // Return version as an int
        version: function() {
            return parseInt(this.get("version").replace(/\./g,""));
        }
    });

    return Addon;
});