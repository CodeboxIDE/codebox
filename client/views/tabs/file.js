define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "views/tabs/base",
    "views/components/files/normal"
], function(_, $, hr, BaseTab, FileView) {
    var FileTab = BaseTab.extend({
        className: BaseTab.prototype.className+ " component-workspace-file",
        defaults: {
            path: "/",
        },
        events: {},
        keyboardShortcuts: _.extend({
            "mod+s": "saveFile"
        }, BaseTab.prototype.keyboardShortcuts),

        /* Constructor */
        initialize: function(options) {
            FileTab.__super__.initialize.apply(this, arguments);

            // Create the file view
            this.file = new FileView({
                base: "/",
                navigate: false
            });

            // Bind file loading event
            this.file.model.on("set", this.adaptFile, this);

            // Bind file error : file removed or invalid file
            this.file.on("file:error", function() {
                this.closeTab();
            }, this);
            this.file.model.on("destroy", function() {
                this.closeTab();
            }, this);

            console.log(this.options);
            
            // When tab is ready : load file
            this.on("tab:ready", function() {
                this.adaptFile();
                this.file.load(this.options.path);
            }, this);

            return this;
        },

        /* Render */
        render: function() {
            this.$el.empty();
            this.file.render();
            this.file.$el.appendTo(this.$el);
            return this.ready();
        },

        /* Change the file */
        load: function(path) {
            this.file.load(path);
            return this;
        },

        /* Adapt the tab to the file (title, ...) */
        adaptFile: function() {
            this.setTabTitle(this.file.model.get("name", "loading..."));
            this.setTabType(this.file.model.isDirectory() ? "directory" : "file");
            this.setTabId(this.file.model.path());
        },

        /* Command save file */
        saveFile: function(e) {
            e.preventDefault();
            if (this.file.model.isDirectory()) return;
            this.file.model.save();
        }
    });

    return FileTab;
});