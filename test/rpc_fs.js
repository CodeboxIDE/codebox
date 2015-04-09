var Q = require("q");
var _ = require("lodash");
var path = require("path");

var rpc = require("../lib/rpc");
var base64 = require('../lib/utils/base64');

describe('RPC fs', function() {
    it("can list content of the root folder", function() {
        return rpc.get("fs").list({})
        .then(function(files) {
            var filenames = _.pluck(files, "name");
            expect(_.contains(filenames, "test.txt"));
        });
    });

    it("can get stat on a file", function() {
        return rpc.get("fs").stat({ path: "test.txt" })
        .then(function(file) {
            expect(file.name).to.equal("test.txt");
        });
    });

    it("can list content of a folder", function() {
        return rpc.get("fs").list({ path: "test" })
        .then(function(files) {
            var filenames = _.pluck(files, "name");
            expect(_.contains(filenames, "test2.txt"));
        });
    });

    it("can read a file", function() {
        return rpc.get("fs").read({ path: "test.txt" })
        .then(function(file) {
            expect(file.content).to.be.a('string');
            expect(base64.atob(file.content)).to.equal("Hello World");
        });
    });

    it("can write a file", function() {
        return rpc.get("fs").write({
            path: "test_new.txt",
            content: base64.atob("test")
        });
    });

    it("can read/write a file without base64", function() {
        return rpc.get("fs").write({
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
            expect(file.content).to.be.a('string');
            expect(file.content).to.equal("test witout base64");
        });
    });

    it("can rename a file", function() {
        return rpc.get("fs").rename({
            from: "test_new.txt",
            to: "test_new2.txt"
        });
    });

    it("can rename a file", function() {
        return rpc.get("fs").rename({
            from: "test_new2.txt",
            name: "test_new3.txt"
        });
    });

    it("can remove a file", function() {
        return rpc.get("fs").remove({
            path: "test_new3.txt"
        });
    });

    it("can create a folder", function() {
        return rpc.get("fs").mkdir({
            path: "folder_new/folder_in"
        });
    });

    it("can rename a folder", function() {
        return rpc.get("fs").rename({
            from: "folder_new",
            to: "folder_new2"
        });
    });

    it("can remove a folder", function() {
        return rpc.get("fs").remove({
            path: "folder_new2"
        });
    });
});
