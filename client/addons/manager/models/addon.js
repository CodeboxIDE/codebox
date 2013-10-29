define(function() {
    var hr = require("hr/hr");
    var addons = require("core/addons");

    var Addon = hr.Model.extend({
        defaults: {
            'name': "",
            'title': "",
            'description': "",
            'version': "0.0.1",
            'author': "",
        },

        isInstalled: function() {
            return addons.isInstalled(this.get("name"));
        },

        install: function() {
            addons.install(this.get("git"))
        },
        uninstall: function() {
            addons.uninstall(this.get("name"))
        }
    });

    return Addon;
});