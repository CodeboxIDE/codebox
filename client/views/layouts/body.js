define([
    "underscore",
    "jQuery",
    "hr/hr",
    "core/box",
    "core/commands",
    "core/files",
    "views/tabs/manager"
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

            // Default tab and dbl click to open new
            this.tabs.on("tabs:default tabs:opennew", function() {
                files.openNew();
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