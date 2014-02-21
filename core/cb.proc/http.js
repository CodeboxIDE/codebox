// Requires
var Q = require('q');
var _ = require('lodash');

var exec = require('../utils').exec;


var REGEX = /\S+/gi;
function split(str) {
    return str.match(REGEX).slice(1);
}

function rsplit(str, sep) {
    var parts = str.split(sep);
    var right = parts.pop();
    var left = parts.join(sep);

    return [
        left,
        right
    ];
}

function lines(str) {
    return str.split('\n').filter(Boolean);
}

function osx() {
    return exec('netstat -nat | grep -i listen')
    .then(function(out) {
        return lines(out.stdout).map(function(line) {
            var parts = split(line);

            var ip = parts[2];

            // *:XXXX or localhost:XXXX
            // Because of strange formatting of netstat on OS X
            return rsplit(ip, '.').join(':');
        });

    })
    .fail(Q([]));
}

function linux() {
    return exec('netstat -nat | grep -i "listen"')
    .then(function(out) {
        return out.stdout.split('\n').filter(Boolean)
        .map(function(line) {
            var parts = split(line);

            // Listening address
            return parts[2];
        });
    })
    .fail(Q[[]]);
}

var ADDR_MAP = {
    // IPv4
    '0.0.0.0': '*',

    // IPv6
    '::': '*'
};

// Split into bind address and port
function normalize(addr) {
    var parts = rsplit(addr, ':');
    var bind = parts[0], port = parts[1];

    return {
        // The address the process is bound to
        bind: ADDR_MAP[bind] || bind,

        // The port it's listening on
        port: port,

        url: 'http://localhost:' + port
    };
}

// Is a pair reachable
function reachable(serv) {
    return serv.bind === '*';
}

// looks like http
function looksHttp(serv) {
    var port = serv.port;
    return (
        port == 80 ||
        port > 1024 && port < 10000
    );
}

var METHODS = {
    'darwin': osx,
    'linux': linux
};


// Mixin 'url' attribute
function urlify(pattern, result) {
    result.url = pattern.replace('%d', result.port);
    return result;
}

// Get list of bind addr & ports
function list(pattern) {
    pattern = pattern || 'http://localhost:%d';

    // OS specific method to call
    var method = METHODS[process.platform];


    return method()
    .then(function(addrs) {
        var results = _.chain(addrs)
        .map(normalize)
        .filter(function(result) {
            // Is this server reachable
            result.reachable = reachable(result);
            return result;
        })
        .filter(looksHttp)
        .map(_.partial(urlify, pattern))
        .sortBy(function(result) {
            return result.port * (result.reachable ? 1 : 10000);
        })
        .value();

        // Remove duplicates
        return _.unique(results, false, function(serv) {
            return [serv.bind, serv.port].join(':');
        });
    });
}

// Exports
exports.osx = osx;
exports.linux = linux;
exports.list = list;
