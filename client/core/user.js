define([
    'hr/hr',
    'models/user'
], function (hr, User) {
    // Current session user
    var user = new User();
    return user;
});