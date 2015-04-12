var _ = require("hr.utils");
var $ = require("jquery");
var View = require("hr.view");

var FormView = require("../form");


var DialogInputView = View.Template.extend({
    className: "dialog-input",
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
        this.value = this.options.value;
    },

    finish: function() {
        var that = this;
        _.defer(function() {
            that.$("input").first().focus();
        });
        return DialogInputView.__super__.finish.apply(this, arguments);
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
        }

        return this.value;
    },

    onConfirm: function(e) {
        if (e) e.preventDefault();

        this.parent.close(e);
    },
    onClose: function(e) {
        if (e) e.preventDefault();
        this.parent.close(null, true);
    }
});

module.exports = DialogInputView;
