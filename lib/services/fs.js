var Q = require('q');
var fs = require('fs');

var workspace = require('../workspace');

var list = function(args) {
    return workspace.path(args.path || ".")
    .then(function(_path) {
        console.log(_path);
    });
};

module.exports = {
    'list': list
};
