define([
    "views/addons"
], function(AddonsList) {
    var DialogView = require("views/dialogs/base");

    var InstallerDialog = DialogView.extend({
        templateLoader: "addon.manager.templates",
        template: "dialog.html",
        events: _.extend({}, DialogView.prototype.events,{
            
        }),

        // Constructor
        initialize: function(options) {
            InstallerDialog.__super__.initialize.apply(this, arguments);

            this.list = new AddonsList();
            return this;
        },

        // Finish rendering
        finish: function() {
            this.list.$el.appendTo(this.$(".list"))
            return InstallerDialog.__super__.finish.apply(this, arguments);
        }
    });

    return InstallerDialog;
});