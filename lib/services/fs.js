var Q = require('q');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var workspace = require('../workspace');


// List files in a directory
var list = function(args) {
    return workspace.path(args.path || ".")
    .then(function(_path) {
        return [Q.nfcall(fs.readdir, _path), _path];
    })
    .spread(function(paths, root) {
        return _.reduce(paths, function(prev, _path) {
            return prev.then(function(files) {
                var _folder = path.resolve(root, _path);

                return Q.nfcall(fs.stat, _folder)
                .then(function(stat) {
                    files.push({
                        'name': _path,
                        'directory': stat.isDirectory(),
                        'size': stat.size,
                        'mtime': stat.mtime.getTime(),
                        'atime': stat.atime.getTime()
                    });

                    return files;
                })
            })

        }, Q([]))
    });
};

module.exports = {
    'list': list
};
