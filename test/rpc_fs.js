var Q = require("q");
var _ = require("lodash");
var path = require("path");

var fs = require("../lib/services/fs");

describe('RPC fs', function() {
    it("can list content of the root folder", function(done) {
        qdone(
            fs.list({})
            .then(function(files) {
                var filenames = _.pluck(files, "name");
                assert(_.contains(filenames, "test.txt"));
            })
        , done);
    });

    it("can get stat on a file", function(done) {
        qdone(
            fs.stat({ path: "test.txt" })
            .then(function(file) {
                assert(file.name == "test.txt");
            })
        , done);
    });
});
