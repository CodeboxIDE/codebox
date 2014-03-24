define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "text!resources/templates/dialogs/alert.html",
    "text!resources/templates/dialogs/confirm.html",
    "text!resources/templates/dialogs/fields.html",
    "text!resources/templates/dialogs/prompt.html",
    "text!resources/templates/dialogs/select.html"
], function(_, $, hr) {

    var DialogView = hr.View.extend({
        className: "component-dialog modal fade",
        defaults: {
            args: {},
            template: null,
            dialog: null,
            open: true,
            autoFocus: false,
            keyboard: true,
            keyboardEnter: true,
            className: "",
            valueSelector: true
        },
        events: {
            "keydown": "keydown",
            "hidden.bs.modal": "hidden",
            "shown.bs.modal": "shown",
            "click .action-close": "close",
            "click .action-confirm": "actionConfirm"
        },
        template: function() {
            if (this.options.template != null) return require("text!"+this.options.template);
            return require("text!resources/templates/dialogs/"+this.options.dialog+".html");
        },
        templateContext: function() {
            return {
                options: this.options
            };
        },

        initialize: function(options) {
            DialogView.__super__.initialize.apply(this, arguments);
            this.$el.addClass(this.options.className);

            this.value = null;
            this.keydownHandler = _.bind(this.keydown, this)

            // Bind keyboard
            if (this.options.keyboard) {
                $(document).bind("keydown", this.keydownHandler);
            }

            return this;
        },

        finish: function() {
            this.open();
            return DialogView.__super__.finish.apply(this, arguments);
        },

        /*
         *  Add to window and open
         */
        open: function() {
            if (DialogView.current != null) DialogView.current.close();

            this.$el.appendTo($("body"));
            this.$el.modal('show');
            DialogView.current = this;
            return this;
        },

        /*
         *  (event) Close the dialog
         */
        close: function(e) {
            if (e != null) {
                e.preventDefault();
            }

            // Unbind dowument keydown
            $(document).unbind("keydown", this.keydownHandler);
            
            // Hide modal
            this.$el.modal('hide');
        },

        /*
         *  (event) Modal is hidden
         */
        hidden: function(e) {
            this.trigger("close", this.value, e);
            this.remove();
            DialogView.current = null;
        },

        /*
         * (event) Modal is shown
         */
        shown: function() {
            if (this.options.autoFocus) {
                $(this.$("input").get(0)).focus();
            }
        },

        /*
         *  (event) action: confirm: close dialog with value from selector
         */
        actionConfirm: function(e) {
            if (e != null) {
                e.preventDefault();
            }
            this.value = this._getValue();
            this.close(e);
        },

        /*
         *  Selector for prompt dialog
         */
        selectorPrompt: function() {
            return this.$(".input").val();
        },

        /*
         *  Return final value
         */
        _getValue: function() {
            var selector = this.options.valueSelector;
            if (_.isFunction(selector)) {
                this.value = selector(this);
            } else if (_.isString(selector)) {
                this.value = this[selector]();
            } else {
                this.value = selector;
            }
            return this.value;
        },

        /*
         *  (event) keydown
         */
        keydown: function(e) {
            if (!this.options.keyboard) return;

            var key = e.keyCode || e.which;

            // Enter: valid
            if (key == 13 && this.options.keyboardEnter) {
                this.actionConfirm(e);
            } else 
            // Esc: close
            if (key == 27) {
                this.close(e);
            }
        }
    }, {
        current: null,
    });

    return DialogView;
});