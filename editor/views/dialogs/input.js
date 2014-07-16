define([
    "hr/utils",
    "hr/dom",
    "hr/hr"
], function(_, $, hr) {
    var DialogInputView = hr.View.extend({
        className: "",
        defaults: {
            className: "",
            template: ""
        },
        events: {

        },

        initialize: function(options) {
            DialogInputView.__super__.initialize.apply(this, arguments);

            // Adapt style
            this.$el.addClass(this.options.className);
        },

        template: function() {
            return this.options.template;
        },
        templateContext: function() {
            return {
                options: this.options
            };
        },
    });

    return DialogInputView;
});