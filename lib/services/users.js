var _ = require("lodash");
var users = require("../users");

// List users
var list = function() {
    return users.list();
};

// Identify the current user
var whoami = function(args, context) {
    return context.user;
};


module.exports = {
    'list': list,
    'whoami': whoami
};
