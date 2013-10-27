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
            'main': "main.js"
        },

        // Return base url for the addon
        url: function() {
            return "/addons/"+this.get("id");
        },

        // Load the addon
        load: function() {
            logging.log("Load", this.get("id"));
            $.getScript(this.url()+"/"+this.get("main")).done(function(script, textStatus ) {
                console.log(arguments);
            
            }).fail(function( jqxhr, settings, exception ) {
                logging.error("Error loading addon: ", exception);
            });
        }
    });

    return Addon;
});