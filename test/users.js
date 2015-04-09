var Q = require("q");
var path = require("path");

var users = require("../lib/users");

describe('Users', function() {
    it("can authenticate", function() {
        return users.auth("test1", "test1");
    });

    it("can't active a non existant user", function() {
        return users.active("test2")
        .then(function(p) {
            throw "Wrong!";
        }, function() {
            return Q();
        });
    });
});
