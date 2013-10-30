define([
    'hr/hr'
], function (hr) {

    var tabs = {
        /*
         *  Return manager view
         */
        manager: function() {
            var app = require('core/app');
            return app.components.body.tabs;
        },

        /*
         *  Open a new tab from TabBase view
         *
         *  Tab: view for the tab
         *  constructor: contructor options
         * options: options for adding the tab
         */
        open: function(Tab, constructor, options) {
            return this.manager().add(Tab, constructor, options);
        }
    };

    return tabs;
});