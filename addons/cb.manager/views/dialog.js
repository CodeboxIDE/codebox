define([
    "views/addons",
    "text!templates/dialog.html"
], function(AddonsList, templateFile) {
    var $ = codebox.require("hr/dom");
    var DialogView = codebox.require("views/dialogs/base");
    var dialogs = codebox.require("utils/dialogs");
    var addons = codebox.require("core/addons");

    var InstallerDialog = DialogView.extend({
        className: "addon-manager-dialog modal fade",
        templateLoader: "text",
        template: templateFile,
        events: _.extend({}, DialogView.prototype.events,{
            "click .action-fromurl": "installFromUrl",
            "click a[data-addons]": "filterAddons"
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
        },

        // Install from url
        installFromUrl: function(e) {
            if (e) e.preventDefault();
            dialogs.prompt("Install a new addon", "GIT url for the addon:", "").then(function(url) {
                addons.install(url).then(function() {
                    dialogs.alert("Installation", "Add-on installed with success!");
                }, function() {
                    dialogs.alert("Installation", "Sorry, installation failed, please check that the url you entered is correct and the GIT repository a correct CodeBox add-on.");
                });
            });
        },

        // Filter addons
        filterAddons: function(e) {
            e.preventDefault();
            var filter = $(e.currentTarget).data("addons");
            var filters = {
                'all': "allIndex",
                'installed': "allInstalled",
                'defaults': "allDefaults",
                'available': "allAvailable"
            };
            this.list.collection.reset([]);
            this.list.collection[filters[filter]]();
        }
    });

    return InstallerDialog;
});