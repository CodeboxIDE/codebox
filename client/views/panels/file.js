define([
    'hr/utils',
    'hr/dom',
    'hr/hr',
    'views/panels/base'
], function(_, $, hr, PanelBaseView) {
    /**
     * Panel related to the current file
     *
     * @constructor
     */
    var PanelFileView = PanelBaseView.extend({
        defaults: {},
        events: {},

        /**
         * The view class to create an instance from for each file
         *
         * @type {hr.View}
         */
        FileView: hr.View,

        /**
         * Displays a popup list of hints for a given editor context.
         *
         * @constructor
         * @param {Object} options
         */
        initialize: function(options) {
            PanelFileView.__super__.initialize.apply(this, arguments);

            var box = codebox.require("core/box");

            // Update tags when file changes
            this.listenTo(box, "file.active", this.update);

            // Different cached file views
            this.fileViews = {};
        },

        /**
         * Update the current file panel
         *
         * @private
         */
        render: function() {
            var box = codebox.require("core/box");
            var path = box.activeFile;

            // Detach all file views
            _.each(this.fileViews, function(view) {
                view.detach();
            });

            // Create view if non existant
            if (!this.fileViews[path]) {
                this.fileViews[path] = new this.FileView({
                    path: path
                });
            }

            this.fileViews[path].update();
            this.fileViews[path].$el.appendTo(this.$el);

            return this.ready();
        }
    });

    return PanelFileView;
});