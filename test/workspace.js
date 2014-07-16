var Q = require("q");
var path = require("path");

var workspace = require("../lib/workspace");

describe('Workspace', function() {
    it("can access a file inside the workspace", function(done) {
        qdone(
            workspace.path(path.join(__dirname, "./test")).thenResolve(true)
        , done);
    });

    it("can't access files outside the workspace", function(done) {
        qdone(
            workspace.path(path.join(__dirname, "../test2"))
            .then(function(p) {
                console.log(p);
                return Q.reject(new Error("wrong"));
            }, function() {
                return Q();
            })
        , done);
    });
});
