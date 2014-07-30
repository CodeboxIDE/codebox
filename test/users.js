var Q = require("q");
var path = require("path");

var users = require("../lib/users");

describe('Users', function() {
    it("can authenticate", function(done) {
        qdone(
            users.auth("test1", "test1")
        , done);
    });

    it("can't active a non existant user", function(done) {
        qdone(
            users.active("test2")
            .then(function(p) {
                return Q.reject(new Error("wrong"));
            }, function() {
                return Q();
            })
        , done);
    });
});
