// Requires
var Q = require('q');
var _ = require('underscore');

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

    return [
        // The address the process is bound to
        ADDR_MAP[bind] || bind,

        // The port it's listening on
        port
    ];
}

// Is a pair reachable
function reachable(pair) {
    var bind = pair[0], port = pair[1];
    return bind === '*';
}

// looks like http
function looksHttp(pair) {
    var bind = pair[0], port = pair[1];
    return (
        port == 80 ||
        port > 1024 && port < 10000
    );
}

var METHODS = {
    'darwin': osx,
    'linux': linux
};


// Get list of bind addr & ports
function list() {
    var method = METHODS[process.platform];

    return method()
    .then(function(addrs) {
        var results = addrs
        .map(normalize)
        .filter(reachable)
        .filter(looksHttp);

        // Remove duplicates
        return _.unique(results, false, function(x) {
            return x.join(':');
        });
    });
}

// Exports
exports.osx = osx;
exports.linux = linux;
exports.list = list;
