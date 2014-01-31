// Requires
var _ = require('lodash');

var crypto = require('cryptojs').Crypto;

function truth() {
    return true;
}

function objHas(obj) {
    return _.partial(
        _.has,
        obj
    );
}

function has(obj, keys) {
    return obj && _.all(
        _.map(
            keys,
            objHas(obj)
        )
    );
}

function md5(data) {
    return crypto.MD5(data).toString();
}

// Exports
exports.has = has;
exports.md5 = md5;
exports.truth = truth;
