define([
    'hr/utils',
    'hr/dom',
    'hr/hr'
], function(_, $, hr) {
    /**
     * Base view for a lateral panel
     *
     * @class
     * @constructor
     */
    var PanelBaseView = hr.View.extend({
        defaults: {
            title: ""
        },
        events: {},

        initialize: function(options) {
            PanelBaseView.__super__.initialize.apply(this, arguments);

            /**
             * Unique id for this panel in the panels manager 
             *
             * @property
             */
            this.panelId = this.options.panel;

            /**
             * Referance to the panels manager
             *
             * @property
             */
            this.manager = this.parent;

            return this;
        },

        /**
         * Show up this panel in the lateral bar
         */
        open: function() {
            this.manager.open(this.panelId);
            return this;
        },

        /**
         * Hide this panel from the lateral bar
         */
        close: function() {
            this.manager.close(this.panelId);
            return this;
        },

        /**
         * Toggle the visibility of this panel
         *
         * @param {boolean} [state] specific state to use
         */
        toggle: function(state) {
            if (state == null) state = !this.isActive();

            if (!state) {
                this.close();
            } else {
                this.open();
            }
            return this;
        },

        /**
         * Check if this panel is visible
         *
         * @returns {boolean}
         */
        isActive: function() {
            return this.manager.isActive(this.panelId);
        },

        /**
         * Connect a command to this panel, the command will toggle this panel
         */
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