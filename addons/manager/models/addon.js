define([], function() {
    var hr = codebox.require("hr/hr");
    var addons = codebox.require("core/addons");

    var Addon = hr.Model.extend({
        defaults: {
            'name': "",
            'git': "",
            'package': {},
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