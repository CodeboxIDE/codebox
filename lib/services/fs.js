var Q = require('q');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var workspace = require('../workspace');

var fileInfos = function(_path, stat) {
    return {
        'path': workspace.relative(_path),
        'name': path.basename(_path),
        'directory': stat.isDirectory(),
        'size': stat.size,
        'mtime': stat.mtime.getTime(),
        'atime': stat.atime.getTime()
    };
};

// Get a file information
var get = function(args) {
    return workspace.path(args.path || ".")
    .then(function(_path) {
        return [Q.nfcall(fs.stat, _path), _path];
    })
    .spread(function(stat, _path) {
        return fileInfos(_path, stat);
    });
};

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
                    files.push(fileInfos(_folder, stat));

                    return files;
                })
            })

        }, Q([]))
    });
};

module.exports = {
    'get': get,
    'list': list
};
