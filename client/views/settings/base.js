define([
    "Underscore",
    "jQuery",
    "hr/hr"
], function(_, $, hr) {
    var SettingsPageView = hr.View.extend({
        template: "settings/base.html",
        defaults: {
            'namespace': "",
            'section': "",
            'title': "",
            'settings': {}
        },
        events: {},

        // Constructor
        initialize: function() {
            SettingsPageView.__super__.initialize.apply(this, arguments);

            this.settings = {
                'namespace': this.options.namespace,
                'section': this.options.section,
                'title': this.options.title,
                'fields': this.options.fields || {}
            };
        },

        // Template context
        templateContext: function() {
            return {
                'settings': this.settings
            }
        },

        // Get settings to save
        submit: function() {
            var data = {};
            var that = this;

            var selectors = {
                'text': function(el) { return el.val(); },
                'number': function(el) { return el.val(); },
                'select': function(el) { return el.val(); },
                'checkbox': function(el) { return el.is(":checked"); },
            };

            _.each(this.settings.fields, function(field, key) {
                data[key] = selectors[field.type](that.$("*[name='"+ that.settings.namespace+"_"+key+"']"));
            });

            console.log(data);

            return data;
        }
    });

    return SettingsPageView;
});