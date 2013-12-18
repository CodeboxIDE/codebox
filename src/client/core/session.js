define([
    "underscore",
    "hr/hr",
    "core/user",
    "core/box",
    "core/addons",
    "core/collaborators",
    "core/offline/manager"
], function(_, hr, user, box, addons, collaborators, offline) {
    // Extend template context
    hr.Template.extendContext({
        'session': {
            'user': user,
            'box': box,
            'addons': addons,
            'collaborators': collaborators
        }
    });

    return {
        // Prepare session
        prepare: function() {
            return offline.check().then(function() {
                return box.status();
            });
        },

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
                // Get collaborators
                return collaborators.getCollaborators();
            });
        },

        // Logout
        exit: function() {
            hr.Cookies.remove("email");
            hr.Cookies.remove("token");
            location.reload();
        }
    };
});