define([
    "Underscore",
    "hr/hr",
    "models/user",
    "models/box",
    "collections/addons",
    "utils/search"
], function(_, hr, User, Codebox, Addons, search) {

    var Session = hr.Class.extend({
        initialize: function() {
            var that = this;
            Session.__super__.initialize.apply(this, arguments);
             
            this.codebox = new Codebox();
            this.user = new User();
            this.addons = new Addons();

            // Load new installed addons
            this.addons.on("add", function(addon) {
                addon.load();
            }, this);


            // Search for files
            search.handler("files", function(query) {
                var d = new hr.Deferred();
                that.codebox.searchFiles(query).done(function(data) {
                    d.resolve(_.map(data.files, _.bind(function(path) {
                        var filename = _.last(path.split("/"));
                        if (filename.length == 0) filename = path;
                        return {
                            "text": filename,
                            "callback": _.bind(function() {
                                that.codebox.trigger("openFile", path);
                            }, this)
                        };
                    }, this)));
                });
                return d;
            });

            return this;
        },

        // Start session
        start: function(email, token) {
            var that = this;
            var d = new hr.Deferred();

            return this.codebox.auth({
                'email': email,
                'token': token
            }, this.user).then(function() {
                // Load addons
                that.addons.getInstalled();

                // Return box status
                return that.codebox.status();
            });
        }
    });

    // Create session
    var session = new Session();


    // Extend template context
    hr.Template.extendContext({
        'session': session
    });

    return session;
});