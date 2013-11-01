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

            this.namespace = this.options.namespace;
            this.title = this.options.title || this.namespace;
            this.section = this.options.section;
            this.fields = this.options.fields || {};
        },

        // Define a field
        setField: function(fieldId, field) {
            this.fields[fieldId] = field;
            this.trigger("field:change", fieldId);
            return this;
        },

        // Template context
        templateContext: function() {
            return {
                'fields': this.fields,
                'namespace': this.namespace,
                'section': this.section
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

            _.each(this.fields, function(field, key) {
                data[key] = selectors[field.type](that.$("*[name='"+ that.namespace+"_"+key+"']"));
            });

            return data;
        }
    });

    return SettingsPageView;
});