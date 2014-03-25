define([
    'hr/hr',
    'utils/url',
    'utils/dialogs',
    'utils/alerts',
    'utils/loading',
    'views/grid',
    'text!resources/templates/main.html',
    'core/box',
    'core/session',
    'core/addons',
    'core/box',
    'core/files',
    'core/commands/toolbar',
    'core/commands/menu',
    'core/commands/statusbar',
    'core/commands/palette',
    'core/tabs',
    'core/panels',
    'core/operations',
    'core/localfs',
    'core/themes',
    'core/search/commands',
    'core/search/files',
    'core/search/tags',
    'core/search/addons',
    'core/search/code'
], function (hr, url, dialogs, alerts, loading, GridView, templateFile,
box, session, addons, box, files, commands, menu, statusbar, palette, tabs, panels, operations, localfs, themes) {

    // Define base application
    var Application = hr.Application.extend({
        name: "Codebox",
        template: templateFile,
        metas: {
            "robots": "noindex, nofollow",
            "description": "Cloud IDE on a box.",
            "apple-mobile-web-app-capable": "yes",
            "apple-mobile-web-app-status-bar-style": "black",
            "viewport": "width=device-width, initial-scale=1, user-scalable=no"
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
            this._autologin = true;
            this.loginError = null;

            // Init base grid for UI
            this.grid = new GridView({
                columns: 1000
            });

            // Add lateral bar: panels and operations
            var v = this.grid.addView(new hr.View(), {
                width: 18
            });
            panels.$el.appendTo(v.$el);
            operations.$el.appendTo(v.$el);

            // Add operations
            operations.on("add remove reset", function() {
                setTimeout(function() {
                    panels.$el.css("bottom", operations.$el.height());
                }, 200);
            });

            // Add tabs
            this.grid.addView(tabs);

            // Default tab: new file
            tabs.on("tabs:default tabs:opennew", function() {
                files.openNew();
            }, this);

            // Offline: state/update
            hr.Offline.on("state", function(state) {
                if (!state) {
                    alerts.show("Caution: Connection lost, Workspace is now in Offline mode", 5000);
                    if (!localfs.isSyncEnabled()) {
                        dialogs.alert("Caution: Connection lost", "Offline file synchronization is not enabled for this workspace, enable it first when online.");
                    }
                } else {
                    dialogs.confirm("Connection detected", "Save changes before refreshing. Do you want to refresh now (unsaved changes will be lost) ?")
                    .then(function() {
                        location.reload();
                    });
                }
            });
            hr.Offline.on("update", function() {
                location.reload();
            });

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
                'loginError': this.loginError
            };
        },

        // Render the application
        render: function() {
            var email = hr.Cookies.get("email");
            var password = hr.Cookies.get("token");

            if (!box.isAuth() && ((email && password) || (email && box.get("public"))) && this._autologin) {
                this.doLogin(email, password);
                return;
            }
            return Application.__super__.render.apply(this, arguments);
        },

        // Finish rendering
        finish: function() {
            var that = this;

            if (box.isAuth()) {
                // Add menu
                menu.$el.appendTo(this.$(".cb-menubar"));
                menu.render();

                // Add statusbar
                statusbar.$el.appendTo(this.$(".cb-statusbar"));
                statusbar.render();
                
                // Add commands
                commands.$el.appendTo(this.$(".cb-commands"));
                commands.render();

                // Add grid
                this.grid.$el.appendTo(this.$(".cb-body"));

                // Add palette
                palette.$el.appendTo(this.$(".cb-body"));
                palette.render();

                // Load addons
                loading.show(addons.loadAll()).fail(function(err) {
                    return dialogs.alert("Error loading Add-ons", 
                        "<p>Error when initializing addons." +
                        " Please check addons states using the addons manager and reinstall problematic add-ons.</p>" +
                        "<p>Error message: "+ (err.message || err) +"</p>" +
                        _.map(err.addonsError || [], function(error) {
                            return "<p> - <b>"+_.escape(error.addon)+"</b>: "+(error.error.message || error.error)+"</p>";
                        }).join("\n"));
                })
                .fin(themes.init)
                .fin(function() {
                    // Load new addons
                    addons.on("add", function(addon) {
                        addon.load();
                    });

                    // Check update
                    hr.Offline.checkUpdate();

                    // Trigger event that app is ready
                    that.trigger("ready");

                    // Open new file if not files opened by addons and no restored tabs
                    tabs.restoreTabs()
                    .then(function(_n) {
                        if (files.active.size() == 0 && _n == 0) files.openNew();
                    });
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

            this.doLogin(email, password);
        },

        // Do login
        doLogin: function(email, password) {
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
                hr.Cookies.set("email", email);
                hr.Cookies.set("token", password);

                that.render();
            }).fail(function(err) {
                that._autologin = false;
                that.loginError = err;

                loading.stop();
                that.render();
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
