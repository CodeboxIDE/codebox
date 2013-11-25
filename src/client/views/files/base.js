define([
    'underscore',
    'jQuery',
    'hr/hr',
    'views/tabs/base',
    'models/file',
    'core/box'
], function(_, $, hr, Tab, File, box) {

    var FilesBaseView = hr.View.extend({
        defaults: {
            'path': null,
            'base': "/",
            'edition': true,
            'notifications': true
        },
        events: {},

        // Constructor
        initialize: function(options) {
            FilesBaseView.__super__.initialize.apply(this, arguments);

            // Related tab
            this.tab = this.parent;

            // Create base model
            if (this.model == null) this.model = new File({"codebox": box});
            this.model.on("set", this.render, this);

            // Load base file
            if (this.options.path != null) this.load(this.options.path);
            return this;
        },

        // Template rendering context
        templateContext: function() {
            return {
                'options': this.options,
                'file': this.model,
                'view': this
            };
        },

        // Render the file view
        render: function() {
            if (this.model.path() == null) {
                return;
            }
            return FilesBaseView.__super__.render.apply(this, arguments);
        },

        // Finish rendering
        finish: function() {
            return FilesBaseView.__super__.finish.apply(this, arguments);
        },

        // Change the file by loading an other file
        load: function(path) {
            var that = this;
            this.model.getByPath(path).then(function() {
                that.trigger("file:load");
            }, function() {
                that.trigger("file:error");
            })
        }
    });

    return FilesBaseView;
});