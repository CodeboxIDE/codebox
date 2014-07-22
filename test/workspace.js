var Q = require("q");
var path = require("path");

var workspace = require("../lib/workspace");

describe('Workspace', function() {
    it("can access a file inside the workspace", function(done) {
        qdone(
            workspace.path(path.join(__dirname, "./workspace/test")).thenResolve(true)
        , done);
    });

    it("can't access files outside the workspace", function(done) {
        qdone(
            workspace.path(path.join(__dirname, "workspace/../test2"))
            .then(function(p) {
                return Q.reject(new Error("wrong"));
            }, function() {
                return Q();
            })
        , done);
    });
});
