define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "codebox/box",
    "codebox/file"
], function(_, $, hr, Codebox, File) {

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
            this.path = null;
            this.codebox = Codebox.current;
            if (this.codebox == null) {
                throw "Error : creating fileview without codebox context";
            }
            if (this.model == null) this.model = new File({
                "codebox": this.codebox
            });
            this.model.on("set", this.render, this);
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
                return this;
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
                console.log("error loading file");
                that.trigger("file:error");
            })
        },
    });

    return FilesBaseView;
});