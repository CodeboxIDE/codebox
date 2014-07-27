var Q = require("q");
var _ = require("lodash");
var path = require("path");

var rpc = require("../lib/rpc");
var base64 = require('../lib/utils/base64');

describe('RPC fs', function() {
    it("can list content of the root folder", function(done) {
        qdone(
            rpc.get("fs").list({})
            .then(function(files) {
                var filenames = _.pluck(files, "name");
                assert(_.contains(filenames, "test.txt"));
            })
        , done);
    });

    it("can get stat on a file", function(done) {
        qdone(
            rpc.get("fs").stat({ path: "test.txt" })
            .then(function(file) {
                assert(file.name == "test.txt");
            })
        , done);
    });

    it("can list content of a folder", function(done) {
        qdone(
            rpc.get("fs").list({ path: "test" })
            .then(function(files) {
                var filenames = _.pluck(files, "name");
                assert(_.contains(filenames, "test2.txt"));
            })
        , done);
    });

    it("can read a file", function(done) {
        qdone(
            rpc.get("fs").read({ path: "test.txt" })
            .then(function(file) {
                assert(_.isString(file.content));
                assert(base64.atob(file.content) == "Hello World");
            })
        , done);
    });

    it("can write a file", function(done) {
        qdone(
            rpc.get("fs").write({
                path: "test_new.txt",
                content: base64.atob("test")
            })
        , done);
    });

    it("can read/write a file without base64", function(done) {
        qdone(
            rpc.get("fs").write({
                path: "test_new.txt",
                content: "test witout base64",
                base64: false
            })
            .then(function() {
                return rpc.get("fs").read({
                    path: "test_new.txt",
                    base64: false
                })
            })
            .then(function(file) {
                assert(_.isString(file.content));
                assert(file.content == "test witout base64");
            })
        , done);
    });

    it("can rename a file", function(done) {
        qdone(
            rpc.get("fs").rename({
                from: "test_new.txt",
                to: "test_new2.txt"
            })
        , done);
    });

    it("can remove a file", function(done) {
        qdone(
            rpc.get("fs").remove({
                path: "test_new2.txt"
            })
        , done);
    });

    it("can create a folder", function(done) {
        qdone(
            rpc.get("fs").mkdir({
                path: "folder_new/folder_in"
            })
        , done);
    });

    it("can rename a folder", function(done) {
        qdone(
            rpc.get("fs").rename({
                from: "folder_new",
                to: "folder_new2"
            })
        , done);
    });

    it("can remove a folder", function(done) {
        qdone(
            rpc.get("fs").remove({
                path: "folder_new2"
            })
        , done);
    });
});
