define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "views/tabs/file",
    "views/tabs/terminal",
    "session"
], function(_, $, hr, FileTab, TerminalTab, session) {

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
            
            // Open file
            session.codebox.on("openFile", function(path, options) {
                options = _.defaults({}, options || {}, {
                    
                });
                this.openFile(path, options);
            }, this);

            // Open terminal
            session.codebox.on("openTerminal", function(path, options) {
                options = _.defaults({}, options || {}, {
                    
                });
                this.openTerminal(options);
            }, this);

            return this;
        },

        // Finish rendering
        finish: function() {
            // Tabs
            this.components.tabs.on("tabs:default", function() {
                this.openFile("/");
            }, this);

            // Open base tabs
            this.openFile("/");

            return BodyView.__super__.finish.apply(this, arguments);
        },

        // Open a new tab
        addTab: function(Tab, buildOptions, options) {
            if (this.components.tabs == null) return;

            this.components.tabs.add(Tab, buildOptions, options);
            return this;
        },

        // Open a file
        openFile: function(path) {

            if (this.components.tabs == null || this.components.tabs.checkTabExists(path)) return;
            var tab = this.components.tabs.getActiveTabByType("directory");
            if (tab != null) {
                // Change current tab to open the file
                tab.view.load(path);
            } else {
                // Add new tab
                this.addTab(FileTab, {
                    "path": path
                }, {
                    "uniqueId": path,
                    "type": "file",
                });
            }
        },

        // Open terminal
        openTerminal: function() {
            return this.addTab(TerminalTab);
        }
    });

    // Register as template component
    hr.View.Template.registerComponent("layout.body", BodyView);

    return BodyView;
});