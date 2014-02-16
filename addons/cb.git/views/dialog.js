define([
    "text!templates/dialog.html",
    "less!stylesheets/git.less"
], function(templateFile) {
    var DialogView = codebox.require("views/dialogs/base");
    var box = codebox.require("core/box");
    var rpc = codebox.require("core/backends/rpc");
    var operations = codebox.require("core/operations");

    var GitDialog = DialogView.extend({
        className: "addon-git-dialog modal fade",
        templateLoader: "text",
        template: templateFile,
        events: _.extend({}, DialogView.prototype.events,{
            "submit form": "submit"
        }),

        // Constructor
        initialize: function(options) {
            var that = this;
            GitDialog.__super__.initialize.apply(this, arguments);

            that.git = null;

            rpc.execute("git/status").then(function(status) {
                that.git = status;
                that.render();
            });
            return this;
        },

        // Template Context
        templateContext: function() {
            return {
                git: this.git
            };
        },

        // Render
        render: function() {
            if (!this.git) return this;
            return GitDialog.__super__.render.apply(this, arguments);
        },

        // Finish rendering
        finish: function() {
            return GitDialog.__super__.finish.apply(this, arguments);
        },

        // Commit (and sync)
        submit: function(e) {
            if (e) e.preventDefault();

            var that = this;
            var sync = this.$(".git-commit .btn-git-sync").hasClass("active");
            var message = this.$(".git-commit textarea").val();

            if (message.length == 0) {
                return;
            }

            operations.start("git.commit", function(op) {
                return rpc.execute("git/commit", {
                    'message': message
                });
            }, {
                title: "Commiting"
            }).then(function() {
                that.close();
            })
        }
    });

    return GitDialog;
});