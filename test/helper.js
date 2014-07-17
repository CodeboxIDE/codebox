var Q = require('q');
var path = require("path");
var codebox = require("../lib");

var config = {
    log: false,
    root: path.resolve(__dirname, "workspace")
};

// Expose assert globally
global.assert = require('assert');

// Init before doing tests
before(function(done) {
    qdone(codebox.prepare(config), done);
});

// Nicety for mocha / Q
global.qdone = function qdone(promise, done) {
    return promise.then(function() {
        return done();
    }, function(err) {
        return done(err);
    }).done();
};
