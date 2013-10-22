define([
    "Underscore",
    "hr/hr",
    "models/user",
    "models/box",
    "utils/url"
], function(_, hr, User, Codebox, Url) {

    var Session = hr.Class.extend({
        initialize: function() {
            Session.__super__.initialize.apply(this, arguments);

            this.queries = Url.parseQueryString();

            this.user = new User();
            this.codebox = new Codebox();

            return this;
        },

        // Start session
        start: function() {
            var that = this;
            var d = new hr.Deferred();

            return this.codebox.auth(this.queries.token, this.user).then(function() {
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