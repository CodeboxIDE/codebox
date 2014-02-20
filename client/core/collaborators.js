define([
    'hr/utils',
    'hr/hr',
    'collections/users',
    'utils/alerts'
], function (_, hr, Users, alerts) {
    // Collection for all current collaborators
    var collaborators = new Users();

    collaborators.on("add", function(user) {
        alerts.show(user.get("name")+" just joined the workspace", 5000);
    });

    collaborators.on("remove", function(user) {
        alerts.show(user.get("name")+" just left the workspace", 5000);
    });

    return collaborators;
});