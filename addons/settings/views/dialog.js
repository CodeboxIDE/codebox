define([
    "less!stylesheets/dialog.less"
], function() {
    var DialogView = require("views/dialogs/base");
    var settings = require("utils/settings");

    var SettingsDialog = DialogView.extend({
        className: "addon-settings-dialog modal fade",
        templateLoader: "addon.settings.templates",
        template: "dialog.html",
        events: _.extend({}, DialogView.prototype.events,{
            "submit form": "submit",
            "click .navbar-brand": "clickTitle"
        }),

        // Template settings
        templateContext: function() {
            return {
                'settings': settings
            }
        },

        // Finish rendering
        finish: function() {
            var that = this;
            settings.each(function(tab) {
                tab.render();
                tab.$el.appendTo(this.$("#settings-tab-"+tab.namespace));
            }, this);
            setTimeout(function() { that.$(".navbar .navbar-nav a:first").tab('show') }, 200);
            return SettingsDialog.__super__.finish.apply(this, arguments);
        },

        // Update settings
        submit: function(e) {
            var that = this;

            if (e != null) {
                e.preventDefault();
                e.stopPropagation();
            }

            settings.save().fin(function() {
                that.close();
            });
        },

        // Click title
        clickTitle: function(e) {
            e.preventDefault();
        }
    });

    return SettingsDialog;
});