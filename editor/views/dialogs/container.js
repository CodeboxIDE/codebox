var _ = require("hr.utils");
var $ = require("jquery");
var View = require("hr.view");

var DialogView = View.extend({
    className: "component-dialog",
    defaults: {
        keyboard: true,
        keyboardEnter: true,

        View: View,
        view: {},
        size: "medium"
    },
    events: {
        "click": "onClick",
        "click .dialog-wrapper": "onWrapperClick",
        "keydown": "keydown"
    },

    initialize: function(options) {
        DialogView.__super__.initialize.apply(this, arguments);

        this.$wrapper = $("<div>", {
            'class': "dialog-wrapper"
        });

        // Bind keyboard
        this.keydownHandler = _.bind(this.keydown, this)
        if (this.options.keyboard) $(document).bind("keydown", this.keydownHandler);

        // Adapt style
        this.$el.addClass("size-"+this.options.size);

        // Build view
        this.view = new options.View(this.options.view, this);
        this.view.appendTo(this.$wrapper);
        this.$wrapper.appendTo(this.$el);
    },

    render: function() {
        this.view.update();

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

        this.trigger("open");

        return this;
    },

    close: function(e, force) {
        if (e) e.preventDefault();

        // Unbind document keydown
        $(document).unbind("keydown", this.keydownHandler);

        // Hide modal
        this.trigger("close", force);
        this.remove();

        DialogView.current = null;
    },

    keydown: function(e) {
        if (!this.options.keyboard) return;

        var key = e.keyCode || e.which;

        // Enter: valid
        if (key == 13 && this.options.keyboardEnter) {
            this.close(e);
        } else
        // Esc: close
        if (key == 27) {
            this.close(e, true);
        }
    },

    onWrapperClick: function(e) {
        e.stopPropagation();
    },
    onClick: function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.close(null, true);
    }
}, {
    current: null,
});

module.exports = DialogView;
