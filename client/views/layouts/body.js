define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "core/box",
    "core/commands",
    "views/tabs/file"
], function(_, $, hr, box, commands, FileTab) {

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
            var that = this;

            // Root file command
            commands.register("files.open", {
                title: "Files",
                icon: "folder-close-alt"
            }, function(args) {
                args = _.defaults({}, args || {}, {
                    'path': "/"
                });
                that.openFile(args.path);
            });

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

            if (this.components.tabs == null) return;
            var tab = this.components.tabs.getActiveTabByType("directory");
            if (tab != null && !this.components.tabs.checkTabExists(path)) {
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
        }
    });

    // Register as template component
    hr.View.Template.registerComponent("layout.body", BodyView);

    return BodyView;
});