var Q = require("q");
var chai = require("chai");
var path = require("path");
var codebox = require("../lib");
var users = require("../lib/users");

var config = {
    log: false,
    root: path.resolve(__dirname, "workspace")
};

// Expose assert globally
global.expect = chai.expect;

// Init before doing tests
before(function() {
    this.timeout(500000);

    return codebox.prepare(config)
    .then(function() {
        return users.auth("test", "test");
    });
});
