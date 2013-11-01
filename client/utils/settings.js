define([
    'hr/hr',
    'core/user',
    'views/settings/base'
], function (hr, user, SettingsPageView) {

    /*
     *  This module define a unify way for addons
     *  to manage user settings.
     */

    var logging = hr.Logger.addNamespace("settings");

    var settings = {
        sections: {'main': {}},

        /*
         *  Define a new settings tab
         *  Tab: View for the tab
         */
        add: function(Tab) {
            var section = Tab.prototype.settings.section || "main";
            var namespace = Tab.prototype.settings.namespace || "main";

            if (!settings.sections[section]) settings.sections[section] = {};

            logging.log("add settings tab", section, namespace);
            settings.sections[section][namespace] = new Tab();
        },

        /*
         *  For all tabs
         */
        each: function(callback, context) {
            _.each(settings.sections, function(sections) {
                _.each(sections, callback, context);
            });
        },

        /*
         *  Save settings
         */
        save: function() {
            var data = {};
            this.each(function(tab) {
                data[tab.settings.namespace] = tab.submit();
            });
            return user.saveSettings(data);
        }
    };

    return settings;
});