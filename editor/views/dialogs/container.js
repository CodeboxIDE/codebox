define([
    "hr/utils",
    "hr/dom",
    "hr/hr"
], function(_, $, hr) {
    var DialogView = hr.View.extend({
        className: "component-dialog",
        defaults: {
            keyboard: true,
            View: hr.View,
            view: {},
            size: "medium"
        },
        events: {
            "keydown": "keydown"
        },

        initialize: function(options) {
            DialogView.__super__.initialize.apply(this, arguments);

            // Bind keyboard
            this.keydownHandler = _.bind(this.keydown, this)
            if (this.options.keyboard) $(document).bind("keydown", this.keydownHandler);

            // Adapt style
            this.$el.addClass("size-"+this.options.size);

            // Build view
            this.view = new options.View(this.options.view, this);
        },

        render: function() {
            this.view.render();
            this.view.appendTo(this);

            return this.ready();
        },

        finish: function() {
            this.open();
            return DialogView.__super__.finish.apply(this, arguments);
        },

        open: function() {
            if (DialogView.current != null) DialogView.current.close();

            this.$el.appendTo($("body"));
            DialogView.current = this;

            return this;
        },

        close: function(e) {
            if (e) e.preventDefault();

            // Unbind document keydown
            $(document).unbind("keydown", this.keydownHandler);

            // Hide modal
            this.trigger("close", this.value, e);
            this.remove();

            DialogView.current = null;
        },

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