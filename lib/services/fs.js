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
        'atime': stat.atime.getTime(),
        'mode': stat.mode
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
    _.defaults(args, {
        'order': true,
        'group': true
    });


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
    })
    .then(function(files) {
        if (!args.order) return files;

        files = _.sortBy(files, function(file) {
            return file.name.toLowerCase();
        });
        if (args.group) {
            var groups = _.groupBy(files, function(file){
                return file.directory ? "directory" : "file";
            });
            files = [].concat(groups["directory"] || []).concat(groups["file"] || []);
        }

        return files;
    });
};

// Read a file
var read = function(args) {
    _.defaults(args, {
        'base64': true
    });

    if (!args.path) throw "Need 'path'";

    return workspace.path(args.path)
    .then(function(_path) {
        return [Q.nfcall(fs.readFile, _path), _path];
    })
    .spread(function(content, _path) {
        return {
            'content': args.base64? base64.btoa(content) : content.toString()
        }
    });
};

// Create a folder
var mkdir = function(args) {
    if (!args.path) throw "Need 'path'";
    if (args.name) args.path = path.join(args.path, args.name);

    return workspace.path(args.path)
    .then(function(_path) {
        return wrench.mkdirSyncRecursive(_path);
    })
    .then(function() {
        return stat(args);
    });
};

// Write a file
var write = function(args) {
    _.defaults(args, {
        'base64': true
    });

    if (!args.path || !args.content) throw "Need 'path' and 'content'";
    if (args.base64) args.content = base64.atob(args.content);

    return workspace.path(args.path)
    .then(function(_path) {
        return Q.nfcall(fs.writeFile, _path, args.content);
    })
    .thenResolve({});
};

// Create a file
var create = function(args) {
    if (!args.path) throw "Need 'path'";
    if (args.name) args.path = path.join(args.path, args.name);

    return workspace.path(args.path)
    .then(function(_path) {
        if (fs.existsSync(_path)) throw "File already exists";
        return Q.nfcall(fs.writeFile, _path, "");
    })
    .then(function() {
        return stat(args);
    });
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

// Rename
var rename = function(args) {
    if (!args.from || !args.to) throw "Need 'from' and 'to'";

    return Q.all([
        workspace.path(args.from),
        workspace.path(args.to)
    ])
    .spread(function(from, to) {
        if (from == workspace.root()) || to == workspace.root() throw "Cannot use root folder";
        if (from == to) throw "'from' is equal to 'to'";
        if (fs.existsSync(to)) throw "Already exists";

        return Q.nfcall(fs.rename, from, to);
    })
    .then(function(r) {
        return stat({ path: args.to });
    });
};

module.exports = {
    'stat': stat,
    'list': list,
    'read': read,
    'write': write,
    'remove': remove,
    'mkdir': mkdir,
    'create': create,
    'rename': rename
};
