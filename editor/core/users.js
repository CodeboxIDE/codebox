define([
    "collections/users",
    "core/events"
], function(Users, events) {
    var users = new Users();

    // Listen to update
    events.on("e:users", function() {
        users.listAll();
    });

    return users;
});