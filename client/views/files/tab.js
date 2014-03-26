define([
    'hr/utils',
    'hr/dom',
    'hr/hr',
    'views/files/base'
], function(_, $, hr, FilesBaseView) {

    var FilesTabView = FilesBaseView.extend({
        shortcuts: {},

        // Constructor
        initialize: function(options) {
            FilesTabView.__super__.initialize.apply(this, arguments);

            // Related tab
            this.tab = this.parent;
            this.tab.setShortcuts(this.shortcuts || {}, this);
            this.fileOptions = {};

            this.on("file:options", function(_options) {
                this.fileOptions = _options;
            }, this);

            return this;
        }
    });

    return FilesTabView;
});