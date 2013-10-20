define([
    "Underscore",
    "jQuery",
    "hr/hr"
], function(_, $, hr) {
    var DialogView = hr.View.extend({
        className: "component-dialog modal fade",
        defaults: {
            args: {},
            template: null,
            dialog: null,
            open: true,
            big: false,
            className: ""
        },
        events: {
            "hidden": "hidden",
            "click .action-close": "close",
            "click .action-confirm": "actionConfirm",
            "click .action-prompt": "actionPrompt"
        },
        template: function() {
            if (this.options.template != null) return this.options.template;
            return "components/dialogs/"+this.options.dialog+".html";
        },
        templateContext: function() {
            return {
                options: this.options
            };
        },

        initialize: function(options) {
            DialogView.__super__.initialize.apply(this, arguments);
            if (this.options.big) this.$el.addClass("modal-big");
            this.$el.addClass(this.options.className);
            this.value = null;
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
            this.$el.modal('hide');
            DialogView.current = null;
        },

        /*
         *  (event) Modal is hidden
         */
        hidden: function() {
            this.trigger("close", this.value);
            this.$el.remove();
        },

        /*
         *  (event) action: confirm
         */
        actionConfirm: function(e) {
            if (e != null) {
                e.preventDefault();
            }
            this.value = true;
            this.close();
        },

        /*
         *  (event) action: prompt
         */
        actionPrompt: function(e) {
            if (e != null) {
                e.preventDefault();
            }
            this.value = this.$(".input").val();
            this.close();
        }
    }, {
        current: null,
    });

    return DialogView;
});