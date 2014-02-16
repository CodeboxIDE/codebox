define([
    "hr/utils",
    "hr/hr",
    "core/user",
    "core/box",
    "core/addons",
    "core/collaborators",
    "core/backends/rpc",
    "core/localfs"
], function(_, hr, user, box, addons, collaborators, rpc, localfs) {
    // Extend template context
    hr.Template.extendContext({
        'session': {
            'user': user,
            'box': box,
            'addons': addons,
            'collaborators': collaborators
        }
    });

    // Redefine check for connection status
    hr.Offline.check = function() {
        return rpc.execute("box/ping").then(function(data) {
            hr.Offline.setState(data.ping == true);
            if (!hr.Offline.isConnected()) {
                return Q.reject(new Error("No connected"));
            }
        }, function() {
            hr.Offline.setState(false);
        })
    };

    return {
        // Prepare session
        prepare: function() {
            return hr.Offline.check().then(function() {
                return box.status();
            }).then(function() {
                return localfs.init(box.get("name"));
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