define([
    "Underscore",
    "hr/hr",
    "models/user",
    "models/box"
], function(_, hr, User, Codebox) {

    var Session = hr.Class.extend({
        initialize: function() {
            Session.__super__.initialize.apply(this, arguments);

            this.user = new User();
            this.codebox = new Codebox();

            return this;
        },

        // Start session
        start: function() {
            var that = this;
            var d = new hr.Deferred();

            this.user.set({
                'name': "Samy",
                'email': "samypesse@gmail.com",
                'userId': "Samy",
                'token': "lol"
            });

            return this.codebox.join(this.user).then(function() {
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