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
        var service = (conn.pathname.split("/"))[2];
        logger.log("connection to service '"+service+"'");

        if (!services[service]) {
            conn.close(404, "Service not found");
            return logger.error("invalid service '"+service+"'");
        }

        conn.do = function(method, data) {
            this.write(JSON.stringify({
                'method': method,
                'data': data
            }));
        }.bind(conn);

        conn.on("data", function(data) {
            try {
                data = JSON.parse(data);
            } catch(e) {
                logger.error("error parsing data:", data);
                return;
            }

            if (data.method) {
                conn.emit("do."+data.method, data.data || {});
            } else {
                conn.emit("message", data);
            }
        });

        services[service].handler(conn);
    });

    socket.installHandlers(server, {
        prefix: '^/socket/(\\w+)'
    });
};

var addService = function(name, handler) {
    logger.log("add service", name);

    services[name] = {
        handler: handler
    };
};


module.exports = {
    init: init,
    service: addService
};
