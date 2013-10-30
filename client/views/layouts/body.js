define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "core/box",
    "core/commands",
    "views/components/tabs"
], function(_, $, hr, box, commands, TabsView) {

    var BodyView = hr.View.extend({
        className: "layout-body",
        defaults: {},
        events: {},

        // Constructor
        initialize: function() {
            BodyView.__super__.initialize.apply(this, arguments);
            var that = this;

            this.tabs = new TabsView();

            return this;
        },

        // Finish rendering
        render: function() {
            this.tabs.$el.appendTo(this.$el);
            return this.ready();
        },
    });

    // Register as template component
    hr.View.Template.registerComponent("layout.body", BodyView);

    return BodyView;
});