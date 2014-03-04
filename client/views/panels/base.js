define([
    'hr/utils',
    'hr/dom',
    'hr/hr'
], function(_, $, hr) {
    var PanelBaseView = hr.View.extend({
        defaults: {
            title: ""
        },
        events: {},

        // Constructor
        initialize: function(options) {
            PanelBaseView.__super__.initialize.apply(this, arguments);

            this.panelId = this.options.panel;
            this.manager = this.parent;

            return this;
        },

        // Open this panel
        open: function() {
            this.manager.open(this.panelId);
            return this;
        },

        // Close this panel
        close: function() {
            this.manager.close();
            return this;
        },

        // Toggle the panel
        toggle: function(st) {
            if (st == null) st = !this.isActive();

            if (!st) {
                this.close();
            } else {
                this.open();
            }
            return this;
        },

        // Check the visibility of this panel
        isActive: function() {
            return this.manager.isActive(this.panelId);
        },

        // Return an associated command to open/close this panel
        connectCommand: function(command) {
            var that = this;
            command.set("action", function() {
                that.toggle();
            });
            this.parent.panelsCommand.menu.add(command);
        }
    });

    return PanelBaseView;
});