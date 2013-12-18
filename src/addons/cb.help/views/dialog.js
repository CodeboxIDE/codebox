define([
    "views/page",
    "text!templates/dialog.html",
    "less!stylesheets/dialog.less"
], function(PageView, templateFile) {
    var DialogView = codebox.require("views/dialogs/base");
    var box = codebox.require("core/box");

    var HelpDialog = DialogView.extend({
        className: "addon-help-dialog modal fade",
        templateLoader: "text",
        template: templateFile,
        events: _.extend({}, DialogView.prototype.events,{
            "click .action-gohome": "openHome"
        }),

        // Constructor
        initialize: function() {
            HelpDialog.__super__.initialize.apply(this, arguments);
            this.page = new PageView({}, this);
            return this;
        },

        // Finish rendering
        finish: function() {
            this.page.render();
            this.page.$el.appendTo(this.$(".help-page-body"));
            return HelpDialog.__super__.finish.apply(this, arguments);
        },

        // Open home page
        openHome: function(e) {
            if (e) e.preventDefault();
            this.page.loadPage()
        }
    });

    return HelpDialog;
});