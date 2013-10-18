var express = require("express");

function setup(options, imports, register) {
	var server = imports.server;
    var logger = imports.logger.namespace("client");

    // Initialize base view
    logger.log("initialize client base view");
    server.disableAuth('/');
    server.app.use('/', express.static(__dirname + '/../../public'));

    register(null, {});
}

// Exports
module.exports = setup;