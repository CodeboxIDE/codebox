define([
    'hr/utils',
    'hr/dom',
    'hr/hr',
    'views/panels/base'
], function(_, $, hr, PanelBaseView) {
    /**
     * Panel related to the current file
     *
     * @class
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
         * @param {Object} options
         */
        initialize: function(options) {
            PanelFileView.__super__.initialize.apply(this, arguments);

            var box = codebox.require("core/box");
            var files = codebox.require("core/files");

            // Remove view when close file
            this.listenTo(files.active, "remove", this.detachFile);

            // Update view when file changes
            this.listenTo(box, "file.active", this.update);

            // Update file view when changes
            this.listenTo(box, "box:watch:change", function(e) {
                this.updateFile(e.data.path);
            });

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
        },

        /**
         * Detach a file from this file panel
         *
         * @private
         */
        detachFile: function(file) {
            var path = _.isString(file) ? file : file.path();
            if (!this.fileViews[path]) return;

            this.fileViews[path].remove();
            delete this.fileViews[path];
        },

        /**
         * Update a file
         *
         * @private
         */
        updateFile: function(file) {
            var path = _.isString(file) ? file : file.path();
            if (!this.fileViews[path]) return;
            
            this.fileViews[path].update();
        }
    });

    return PanelFileView;
});