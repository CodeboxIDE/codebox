define([
    "q",
    "underscore",
    "jQuery",
    "hr/hr",
    "core/api",

    // addons dependencies
    "core/globals",
    "utils/themes",
    "utils/tabs",
    "utils/settings"
], function(Q, _, $, hr, api) {
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
        load: function() {
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
                'urlArgs': "bust=" + hr.configs.revision+"&version="+this.get("version"),
                'paths': {
                    "require-tools": "/static/require-tools"
                },
                'map': {
                    '*': {
                        'css': 'require-tools/css/css',
                        'less': 'require-tools/less/less'
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

            // Load main module
            addonRequire([main], function() {
                that.set("state", "loaded");
                d.resolve();
            }, function(err) {
                that.set("state", "error");
                d.reject(err);
            });

            return d.promise;
        }
    });

    return Addon;
});