// Requires
var _ = require('lodash');
var crc = require('crc');

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

function hash(str) {
    return crc.hex32(crc.crc32(str));
}

// Exports
exports.has = has;
exports.hash = hash;
exports.truth = truth;
