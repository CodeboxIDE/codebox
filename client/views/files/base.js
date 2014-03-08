define([
    'hr/utils',
    'hr/dom',
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
        shortcuts: {},

        // Constructor
        initialize: function(options) {
            FilesBaseView.__super__.initialize.apply(this, arguments);

            // Create base model
            if (!this.model) this.model = new File({"codebox": box});

            // Listen on model events
            this.listenTo(this.model, "refresh set", this.update);

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