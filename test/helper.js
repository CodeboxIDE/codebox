var Q = require("q");
var chai = require("chai");
var path = require("path");
var wrench = require("wrench");
var os = require("os");
var codebox = require("../lib");
var users = require("../lib/users");

var packagesFolder = path.resolve(__dirname, "./packages");
try {
    wrench.mkdirSyncRecursive(packagesFolder, 0777);
} catch (e) {}

var config = {
    log: false,
    root: path.resolve(__dirname, "workspace"),
    packages: {
    	root: packagesFolder
    }
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
