var Q = require("q");
var $ = require("jquery");
var _ = require("hr.utils");
var Model = require("hr.model");
var logger = require("hr.logger")("package");

function getScript(url, callback) {
  var head = document.getElementsByTagName("head")[0];
  var script = document.createElement("script");
  script.src = url;

  // Handle Script loading
  {
     var done = false;

     // Attach handlers for all browsers
     script.onload = script.onreadystatechange = function(){
        if ( !done && (!this.readyState ||
              this.readyState == "loaded" || this.readyState == "complete") ) {
           done = true;
           if (callback)
              callback();

           // Handle memory leak in IE
           script.onload = script.onreadystatechange = null;
        }
     };

    script.onerror = function(err) {
        callback(err);
    };
  }

  head.appendChild(script);

  // We handle everything using the script element injection
  return undefined;
}

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
        getScript(this.url()+"/pkg-build.js", function(err) {
            if (!err) return d.resolve();

            logger.exception("Error loading plugin:", err);
            d.reject(err);
        });

        return d.promise.timeout(10000, "This addon took to long to load (> 10seconds)");
    },

    /**
     * Return version as a number
     */
    version: function() {
        return parseInt(this.get("version").replace(/\./g,""));
    }
});

module.exports = Package;
