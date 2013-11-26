define([
    'hr/hr',
    'core/user',
    'views/settings/base'
], function (hr, user, SettingsPageView) {

    /*
     *  This module define a unify way
     *  to manage user settings.
     */

    var logging = hr.Logger.addNamespace("settings");

    var settings = {
        sections: {},

        /*
         *  Define a new settings tab
         *  Tab: View for the tab
         */
        add: function(Tab, options) {
            var section, namespace;
            if (!_.isFunction(Tab)) {
                options = Tab;
                Tab = SettingsPageView;
            }

            var tab = new Tab(options);

            var namespace = tab.namespace || "main";

            logging.log("add settings tab", namespace);
            settings.sections[namespace] = tab;

            var defaults = options.defaults || {};
            var currentValues = user.get("settings."+namespace, {});
            currentValues = _.defaults(currentValues, defaults);
            user.set("settings."+namespace, currentValues);
            return tab;
        },

        /*
         *  For all tabs
         */
        each: function(callback, context) {
            _.each(settings.sections, callback, context);
        },

        /*
         *  Save settings
         */
        save: function() {
            var data = {};
            this.each(function(tab) {
                data[tab.namespace] = tab.submit();
            });
            return user.saveSettings(data);
        }
    };

    return settings;
});