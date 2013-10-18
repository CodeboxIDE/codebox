var express = require("express");

function setup(options, imports, register) {
    var app = imports.server.app;
    var logger = imports.logger.namespace("client");

    // Initialize base view
    logger.log("initialize client base view")
    app.use('/', express.static(__dirname + '/../../public'));

    register(null, {});
}

// Exports
module.exports = setup;