define([
    "Underscore",
    "jQuery",
    "hr/hr"
], function(_, $, hr) {
    var SettingsPageView = hr.View.extend({
        settings: {
            namespace: null,
            section: null,
            title: null
        },
        defaults: {},
        events: {},

        // Get settings to save
        submit: function() {
            return {};
        }
    });

    return SettingsPageView;
});