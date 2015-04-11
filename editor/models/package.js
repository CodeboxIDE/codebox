var Q = require("q");
var $ = require("jquery");
var _ = require("hr.utils");
var Model = require("hr.model");
var logger = require("hr.logger")("package");

var Package = Model.extend({
    defaults: {
        name: null,
        errors: []
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
    load: function() {
        var context, main, pkgRequireConfig, pkgRequire, that = this
        var d = Q.defer();

        if (!this.get("browser")) return Q();

        logger.log("Load", this.get("name"));
        $.getScript(this.url()+"/pkg-build.js")
        .done(function(script, textStatus) {
            d.resolve();
        })
        .fail(function(jqxhr, settings, exception) {
            logger.error("Error loading plugin:", exception.stack || exception.message || exception);
            d.reject(exception);
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

module.exports = Package;
