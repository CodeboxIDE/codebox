define([
    "hr/hr",
    "models/user",
    "models/box"
], function(hr, User, Codebox) {
    // Session user
    var user = new User();

    // Associated codebox
    var codebox = new Codebox();

    // Start session
    var start = function() {
        var d = new hr.Deferred();

        user.set({
            'name': "Samy",
            'email': "samypesse@gmail.com",
            'userId': "Samy",
            'token': "lol"
        });

        return codebox.join(user).then(function() {
            return codebox.status();
        });
    };


    // Session representation
    var session = {
        'user': user,
        'codebox': codebox,
        'start': start
    };

    // Extend template context
    hr.Template.extendContext({
        'session': session
    });

    return session;
});