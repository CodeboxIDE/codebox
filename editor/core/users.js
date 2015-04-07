var Users = require("../collections/users");
var events = require("./events");

var users = new Users();

// Listen to update
events.on("e:users", function() {
    users.listAll();
});

module.exports = users;
