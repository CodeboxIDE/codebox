// Requires
var Q = require('q');
var exec = require('../utils').exec;

var REGEX = /\S+/gi;
function split(str) {
    return str.match(REGEX).slice(1);
}

function lines(str) {
    return str.split('\n').filter(Boolean);
}

function osx() {
    return exec('lsof -i -P | grep -i "listen"')
    .then(function(out) {
        return lines(out.stdout).map(function(line) {
            console.log(line);

            var parts = split(line);

            // *:XXXX or localhost:XXXX
            return parts[parts.length - 2];
        });

    })
    .fail(Q([]));
}

function linux() {
    return exec('netstat -nat | grep -i "listen"')
    .then(function(out) {
        console.log(out.stdout);
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
    var parts = addr.split(':');
    var port = parseInt(parts.pop(), 10);
    var bind = parts.join(':');

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
        return addrs
        .map(normalize)
        .filter(reachable)
        .filter(looksHttp);
    });
}

// Exports
exports.osx = osx;
exports.linux = linux;
exports.list = list;
