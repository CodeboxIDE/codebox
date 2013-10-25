require([
    "Underscore",
    "hr/hr",
    "hr/args",
    "utils/url",
    "session",
    "config",
    'views/views',
    'resources/resources',
], function(_, hr, args, url, session, config) {
    // Configure hr
    hr.configure(args);

    // Extend template context
    hr.Template.extendContext({
        'app': {
            'config': config
        }
    });

    // Define base application
    var Application = hr.Application.extend({
        name: "Codebox",
        template: "main.html",
        metas: {
            "description": "Cloud IDE on a box."
        },
        links: {
            "icon": hr.Urls.static("images/favicon.png")
        },
        events: {
            "submit .login-box form": "actionLoginBox"
        },

        // Constructor
        initialize: function() {
            Application.__super__.initialize.apply(this, arguments);
            this.isAuth = false; 
            return this;
        },

        // Template rendering context
        templateContext: function() {
            var queries = url.parseQueryString();
            return {
                'email': queries.email || hr.Storage.get("email"),
                'token': queries.token || hr.Storage.get("token"),
                'isAuth': this.isAuth
            };
        },

        // Login to box
        actionLoginBox: function(e) {
            var that = this;
            if (e) {
                e.preventDefault();
            }
            var email = this.$(".login-box #login-email").val();
            var password = this.$(".login-box #login-token").val();
            var tosave = this.$(".login-box #login-save").is(":checked");

            session.start(email, password).then(function() {
                if (tosave) {
                    hr.Storage.set("email", email);
                    hr.Storage.set("token", password);
                } else {
                    hr.Storage.set("email", "");
                    hr.Storage.set("token", "");
                }

                that.isAuth = true;
                that.render();
            }, function() {
                that.$(".login-box .form-group").addClass("has-error");
            });
        }
    });

    var app = new Application();
    app.run();
});