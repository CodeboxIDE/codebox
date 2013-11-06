define([
    "underscore",
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

            return box.auth({
                'email': email,
                'token': token
            }, user).then(function() {
                // Get installed addons
                return addons.getInstalled();
            }).then(function() {
                // Return box status
                return box.status();
            });
        }
    };
});