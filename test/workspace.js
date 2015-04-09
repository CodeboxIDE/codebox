var Q = require("q");
var path = require("path");

var workspace = require("../lib/workspace");

describe('Workspace', function() {
    it("can access a file inside the workspace", function() {
        return workspace.path(path.join(__dirname, "./workspace/test")).thenResolve(true);
    });

    it("can't access files outside the workspace", function() {
        return workspace.path(path.join(__dirname, "workspace/../test2"))
        .then(function(p) {
            throw "Wrong!";
        }, function() {
            return Q();
        });
    });
});
