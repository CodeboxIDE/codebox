define([
    "underscore",
    "jQuery",
    "hr/hr",
    "core/box",
    "core/commands",
    "core/files",
    "views/components/tabs"
], function(_, $, hr, box, commands, files, TabsView) {

    var BodyView = hr.View.extend({
        className: "layout-body",
        defaults: {},
        events: {},

        // Constructor
        initialize: function() {
            BodyView.__super__.initialize.apply(this, arguments);
            var that = this;

            this.tabs = new TabsView();
            this.tabs.on("tabs:default", function() {
                files.open("/");
            }, this);

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