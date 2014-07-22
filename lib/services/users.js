var _ = require("lodash");
var users = require("../users");

// List users
var list = function() {
    return users.list();
};

module.exports = {
    'list': list
};
