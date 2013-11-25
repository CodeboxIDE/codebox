// Requires
var has = require('./utils').has;
var truth = require('./utils').truth;

// UTILITY

function isCursor(cursor) {
    return has(cursor,
        ['x', 'y']
    );
}

function isHash(hash) {
    return has(hash,
        ['before', 'after']
    );
}

// VALIDATORS :


// Dummy validators
var ping = truth;
var save = truth;
var sync = truth;
var close = truth;


function base(data) {
    return has(data,
        [
            'token',
            'from',
            'action',
            'environment'
        ]
    );
}

function selectCursor(data) {
    return isCursor(data.start) && isCursor(data.end);
}

function moveCursor(data) {
    return has(data,
        ['from']
    ) && isCursor(data.cursor);
}

function patch(data) {
    return has(data,
        ['patch']
    ) && isHash(data.hashs);
}

function load(data) {
    return has(data,
        ['path']
    );
}

// Exports
exports.base = base;
exports.ping = ping;
exports.sync = sync;
exports.save = save;
exports.load = load;
exports.close = close;
exports.patch = patch;
exports.moveCursor = moveCursor;
exports.selectCursor = selectCursor;
