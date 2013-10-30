define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "core/api",

    // addons dependencies
    "utils/tabs"
], function(_, $, hr, api) {
    var logging = hr.Logger.addNamespace("addon");

    var Addon = hr.Model.extend({
        defaults: {
            'name': "",
            'title': "",
            'description': "",
            'version': "0.0.1",
            'author': "",
            'main': "main"
        },

        // Return base url for the addon
        url: function() {
            return "/static/addons/"+this.get("name");
        },

        // Load the addon
        load: function() {
            logging.log("Load", this.get("name"));
            var context = "addon."+this.get("name");

            // Require context
            var addonRequire = require.config({
                'context': context,
                'baseUrl': this.url(),
                'urlArgs': "bust=" + (new Date()).getTime(),
                'paths': {
                    "require-tools": "/static/require-tools"
                },
                'map': {
                  '*': {
                    'css': 'require-tools/css/css',
                    'less': 'require-tools/less/less'
                  }
                }
            });

            // Ressources
            hr.Resources.addNamespace(context+".templates", {
                loader: "http",
                base: "/addons/"+this.get("name")+"/templates"
            });

            // Load main module
            addonRequire([this.get("main")]);
        }
    });

    return Addon;
});