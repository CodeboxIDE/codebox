var Q = require('q');
var _ = require('lodash');
var sockjs = require('sockjs');
var events = require('events');

var logger = require('./utils/logger')("socket");

var services = {};

var init = function(server, config) {
    var socket = sockjs.createServer({
        log: logger.log.bind(logger)
    });

    socket.on('connection', function(conn) {
        var service = (conn.pathname.split("/"))[1];
        logger.log("connection to service '"+service+"'");

        if (!services[service]) {
            conn.close(404, "Service not found");
            return logger.error("invalid service '"+service+"'");
        }

        services[service].handler(conn);
    });

    socket.installHandlers(server, {
        prefix: '^/socket/(\\w+)'
    });
};

var addService = function(name, handler) {
    services[name] = {
        handler: handler
    };
};


module.exports = {
    init: init,
    service: addService
};
