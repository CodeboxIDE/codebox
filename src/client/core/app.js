define([
    'hr/hr',
    'utils/url',
    'utils/dialogs',
    'core/box',
    'core/session',
    'core/addons',
    'core/box',
    'core/files',
    'core/commands',
    'core/menu',
    'core/tabs',
    'core/panels',
    'core/operations'
], function (hr, url, dialogs, 
box, session, addons, box, files, commands, menu, tabs, panels, operations) {

    // Define base application
    var Application = hr.Application.extend({
        name: "Codebox",
        template: "main.html",
        metas: {
            "description": "Cloud IDE on a box."
        },
        links: {
            "icon": hr.Urls.static("images/icons/32.png"),
            "apple-touch-icon": hr.Urls.static("images/icons/ios.png")
        },
        events: {
            "click .cb-login .login-box #login-submit": "actionLoginBox"
        },

        // Constructor
        initialize: function() {
            Application.__super__.initialize.apply(this, arguments);

            // Tabs
            tabs.on("tabs:default tabs:opennew", function() {
                files.openNew();
            }, this);

            // Panels
            panels.on("open", function() {
                this.toggleMode("body-fullpage", false);
            }, this);
            panels.on("close", function() {
                this.toggleMode("body-fullpage", true);
            }, this);

            // Connexion status
            box.on("status", function(state) {
                this.$(".cb-connexion-alert").toggle(!state);
            }, this);

            // Title changed
            box.on("change:name", function() {
                this.title(box.get("name"));
            }, this);

            return this;
        },

        // Template rendering context
        templateContext: function() {
            return {
                'email': hr.Cookies.get("email"),
                'token': hr.Cookies.get("token"),
            };
        },

        // Finish rendering
        finish: function() {
            var that = this;

            var email = this.$(".login-box #login-email").val();
            var password = this.$(".login-box #login-token").val();

            if (email && password) {
                this.doLogin(email, password, true);
            } else if (box.isAuth()) {
                // Add menu
                menu.$el.appendTo(this.$(".cb-menubar"));
                menu.render();
                
                // Add commands
                commands.$el.appendTo(this.$(".cb-commands"));
                commands.render();

                // Add tabs
                tabs.$el.appendTo(this.$(".cb-body"));
                tabs.render();

                // Add panels
                panels.$el.appendTo(this.$(".cb-panels"));
                panels.render();

                // Add operations
                operations.$el.appendTo(this.$(".lateral-operations"));
                operations.render();

                // Load addons
                addons.loadAll().fail(function(err) {
                    dialogs.alert("Warning!", "Error when initializing addons, it's possible that one of the addons is not correctly loaded. Please check addons states using the addons manager.");
                }).fin(function() {
                    // Remove loading state
                    that.$(".cb-loading-alert").remove();
                    
                    // Load new addons
                    addons.on("add", function(addon) {
                        addon.load();
                    });

                    // Open root files
                    files.openNew();
                });
            }
            return Application.__super__.finish.apply(this, arguments);
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

            this.doLogin(email, password, tosave);
        },

        // Do login
        doLogin: function(email, password, tosave) {
            var that = this;

            // If public: generate a random password
            if (box.get("public")) {
                password = Math.random().toString(36).substring(8);
            }

            // Clear errors
            this.$(".login-box .form-group").removeClass("has-error");

            // No email
            if (!email) {
                this.$(".login-box #login-email").parent(".form-group").addClass("has-error");
                return Q.reject(new Error("No email"));
            }

            // No password
            if (!password) {
                this.$(".login-box #login-token").parent(".form-group").addClass("has-error");
                return Q.reject(new Error("No password"));
            }

            return session.start(email, password).then(function() {
                if (tosave) {
                    hr.Cookies.set("email", email);
                    hr.Cookies.set("token", password);
                } else {
                    hr.Cookies.set("email", "");
                    hr.Cookies.set("token", "");
                }
                that.render();
            }).fail(function(err) {
                that.$(".login-box .form-group").addClass("has-error");
                dialogs.alert("Error at login", err.message);
            });
        },

        // Toggle mode
        toggleMode: function(mode, st) {
            $("#codebox").toggleClass("mode-"+mode, st);
            st = this.hasMode(mode);
            $(".cb-active-mode-"+mode).toggleClass("active", st);
            $(".cb-inactive-mode-"+mode).toggleClass("active", !st);
        },
        hasMode: function(mode, st) {
            return $("#codebox").hasClass("mode-"+mode);
        }
    });

    var app = new Application();
    return app;
});
