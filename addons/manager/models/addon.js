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

        isDefault: function() {
            return addons.isDefault(this.get("name"));
        },

        install: function() {
            return addons.install(this.get("git"));
        },
        uninstall: function() {
            return addons.uninstall(this.get("name"));
        }
    });

    return Addon;
});