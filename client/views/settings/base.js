define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "text!resources/templates/settings/base.html"
], function(_, $, hr, templateFile) {
    var SettingsPageView = hr.View.extend({
        template: templateFile,
        defaults: {
            'namespace': "",
            'title': "",
            'settings': {}
        },
        events: {
            "click button[data-settings-action]": "triggerFieldAction"
        },

        // Constructor
        initialize: function() {
            SettingsPageView.__super__.initialize.apply(this, arguments);
            var user = require("core/user");

            this.namespace = this.options.namespace;
            this.title = this.options.title || this.namespace;
            this.fields = this.options.fields || {};
            this.defaults = this.options.defaults || {};
            this.user = user.settings(this.namespace);
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
                'defaults': this.defaults,
                'namespace': this.namespace,
                'section': this.section
            }
        },

        // Trigger action
        triggerFieldAction: function(e) {
            e.preventDefault();

            var $btn = $(e.currentTarget);
            var fieldId = $btn.data("settings-action");

            if (!this.fields[fieldId]) return;

            $btn.button("loading");
            this.fields[fieldId].trigger(fieldId).fin(function() {
                $btn.button("reset");
            });
        },

        // Get settings to save
        submit: function() {
            var data = {};
            var that = this;

            var selectors = {
                'text': function(el) { return el.val(); },
                'password': function(el) { return el.val(); },
                'textarea': function(el) { return el.val(); },
                'number': function(el) { return el.val(); },
                'select': function(el) { return el.val(); },
                'checkbox': function(el) { return el.is(":checked"); },
                'action': function(el)  { return null; }
            };

            _.each(this.fields, function(field, key) {
                var v = selectors[field.type](that.$("*[name='"+ that.namespace+"_"+key+"']"));
                if (v !== null) data[key] = v;
            });

            return data;
        }
    });

    return SettingsPageView;
});