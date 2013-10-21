define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "views/tabs/file",
    "session"
], function(_, $, hr, FileTab, session) {

    var BodyView = hr.View.extend({
        className: "layout-body",
        template: "layouts/body.html",
        defaults: {},
        events: {},

        tabTypes: {
            'explorer': FileTab
        },

        // Constructor
        initialize: function() {
            BodyView.__super__.initialize.apply(this, arguments);
            
            session.on("openFile", function(options) {
                options = _.defaults({}, options || {}, {
                    'path': '/'
                });
                this.addTab(FileTab, {
                    'path': options.path
                });
            }, this);

            return this;
        },

        // Finish rendering
        finish: function() {
            return BodyView.__super__.finish.apply(this, arguments);
        },

        // Open a new tab
        addTab: function(Tab, options) {
            if (this.components.tabs == null) return;

            this.components.tabs.add(Tab, options);
            return this;
        }
    });

    // Register as template component
    hr.View.Template.registerComponent("layout.body", BodyView);

    return BodyView;
});