define([
    'underscore',
    'jQuery',
    'hr/hr',
    'views/tabs/base'
], function(_, $, hr, Tab) {

    var FileTab = Tab.extend({
        defaults: {},

        initialize: function(options) {
            FileTab.__super__.initialize.apply(this, arguments);

            this.fileHandler = this.options.handler;

            if (!this.fileHandler || !this.fileHandler.View) {
                throw "Invalid handler for file tab";
            }

            // Bind file events
            this.model.on("set", this.render, this);
            this.model.on("destroy", function() {
                this.closeTab();
            }, this);
            
            // When tab is ready : load file
            this.on("tab:ready", function() {
                this.adaptFile();
            }, this);

            return this;
        },

        /* Render */
        render: function() {
            this.$el.empty();
            var f = new this.fileHandler.View({
                model: this.model
            }, this);
            f.render();
            f.$el.appendTo(this.$el);
            this.adaptFile();
            return this.ready();
        },

        /* Change the file */
        load: function(path, handler) {
            var that = this;
            if (handler) {
                this.fileHandler = handler;
            }
            this.model.getByPath(path).then(null, function() {
                that.closeTab();
            })
            return this;
        },

        /* Adapt the tab to the file (title, ...) */
        adaptFile: function() {
            this.setTabTitle(this.model.get("name", "loading..."));
            this.setTabType(this.model.isDirectory() ? "directory" : "file");
            this.setTabId(this.fileHandler.id+":"+this.model.syncEnvId());
            return this;
        }
    });

    return FileTab;
});