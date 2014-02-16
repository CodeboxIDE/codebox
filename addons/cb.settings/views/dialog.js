define([
    "text!templates/dialog.html",
    "less!stylesheets/dialog.less"
], function(templateFile) {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var DialogView = codebox.require("views/dialogs/base");
    var settings = codebox.require("core/settings");

    var SettingsDialog = DialogView.extend({
        className: "addon-settings-dialog modal fade",
        templateLoader: "text",
        template: templateFile,
        events: _.extend({}, DialogView.prototype.events,{
            "submit form": "submit",
            "shown.bs.tab a[data-toggle='tab']": "changeTab"
        }),

        // Template settings
        templateContext: function() {
            return {
                'settings': settings,
                'tabs': _.pairs(settings.sections),
                'limit': 3
            }
        },

        // Finish rendering
        finish: function() {
            var that = this;
            settings.each(function(tab) {
                tab.render();
                tab.$el.appendTo(this.$("#settings-tab-"+tab.namespace));
            }, this);
            setTimeout(function() { 
                if (that.options.page) {
                    that.$(".settings-menu a[href='#settings-tab-"+that.options.page+"']").tab('show');
                } else {
                    that.$(".settings-menu a:first").tab('show');
                }
            }, 200);
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

        // Change tab
        changeTab: function(e) {
            this.$(".settings-title").text($(e.target).text());
        }
    });

    return SettingsDialog;
});