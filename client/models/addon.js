define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "core/api"
], function(_, $, hr, api) {
    var logging = hr.Logger.addNamespace("addon");

    var Addon = hr.Model.extend({
        defaults: {
            'id': "",
            'name': "",
            'description': "",
            'version': "0.0.1",
            'author': "",
            'main': "main"
        },

        // Return base url for the addon
        url: function() {
            return "/addons/"+this.get("id");
        },

        // Load the addon
        load: function() {
            logging.log("Load", this.get("id"));

            var addonRequire = require.config({
                'context': "addon-"+this.get("name"),
                'baseUrl': this.url()
            });

            addonRequire([this.get("main")]);
        }
    });

    return Addon;
});