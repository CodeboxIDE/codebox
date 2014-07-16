define([
    "hr/utils",
    "hr/dom",
    "hr/hr"
], function(_, $, hr) {
    var DialogInputView = hr.View.extend({
        className: "",
        defaults: {
            className: "",
            template: "",
            value: true
        },
        events: {
            "click .do-close": "onClose",
            "click .do-confirm": "onConfirm"
        },

        initialize: function(options) {
            DialogInputView.__super__.initialize.apply(this, arguments);

            // Adapt style
            this.$el.addClass(this.options.className);

            // Value
            this.value = null;
        },

        template: function() {
            return this.options.template;
        },
        templateContext: function() {
            return {
                options: this.options
            };
        },

        getValue: function() {
            var selector = this.options.value;
            if (_.isFunction(selector)) {
                this.value = selector(this);
            } else if (_.isString(selector)) {
                this.value = this[selector]();
            } else {
                this.value = selector;
            }
            return this.value;
        },

        onConfirm: function(e) {
            if (e) e.preventDefault();

            this.value = this.getValue();
            this.parent.close(e);
        },
        onClose: function(e) {
            if (e) e.preventDefault();

            this.parent.close();
        }
    });

    return DialogInputView;
});