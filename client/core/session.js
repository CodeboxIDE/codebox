define([
    "Underscore",
    "hr/hr",
    "core/user",
    "core/box",
    "core/addons",
    "core/commands",
    "core/collaborators"
], function(_, hr, user, box, addons, commands, collaborators) {
    // Extend template context
    hr.Template.extendContext({
        'session': {
            'user': user,
            'box': box,
            'addons': addons,
            'commands': commands,
            'collaborators': collaborators
        }
    });

    return {
        // Start session
        start: function(email, token) {
            var that = this;
            var d = new hr.Deferred();

            return box.auth({
                'email': email,
                'token': token
            }, user).then(function() {
                // Load addons
                addons.getInstalled();

                // Return box status
                return box.status();
            });
        }
    };
});