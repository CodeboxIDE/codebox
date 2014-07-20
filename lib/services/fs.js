var Q = require('q');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var wrench = require('wrench');

var workspace = require('../workspace');
var base64 = require('../utils/base64');

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
var stat = function(args) {
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

// Read a file
var read = function(args) {
    if (!args.path) throw "Need 'path'";

    return workspace.path(args.path)
    .then(function(_path) {
        return [Q.nfcall(fs.readFile, _path), _path];
    })
    .spread(function(content, _path) {
        return {
            'content': base64.btoa(content)
        }
    });
};

// Create a folder
var mkdir = function(args) {
    if (!args.path) throw "Need 'path'";

    return workspace.path(args.path)
    .then(function(_path) {
        return wrench.mkdirSyncRecursive(_path);
    })
    .thenResolve({});
};

// Write a file
var write = function(args) {
    if (!args.path || !args.content) throw "Need 'path' and 'content'";

    return workspace.path(args.path)
    .then(function(_path) {
        return Q.nfcall(fs.writeFile, _path, base64.atob(args.content));
    })
    .thenResolve({});
};

// Remove a file
var remove = function(args) {
    if (!args.path) throw "Need 'path'";

    return Q.all([
        workspace.path(""),
        workspace.path(args.path)
    ])
    .spread(function(root, _path) {
        if (root == _path) throw "Cannot remove root folder";

        return [Q.nfcall(fs.stat, _path), _path];
    })
    .spread(function(stat, _path) {
        if (!stat.isDirectory()) return [Q.nfcall(fs.unlink, _path), _path];

        return [Q.nfcall(wrench.rmdirRecursive, _path), _path];
    })
    .thenResolve({});
};

module.exports = {
    'stat': stat,
    'list': list,
    'read': read,
    'write': write,
    'remove': remove,
    'mkdir': mkdir
};
