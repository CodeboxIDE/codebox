var Q = require('q');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var wrench = require('wrench');
var stream = require('stream');
var mime = require('mime');
var base64Stream = require('base64-stream');

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
        'mode': stat.mode,
        'mime': mime.lookup(_path)
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
        'base64': true,
        'override': true,
        'createParent': true
    });

    var isStream = args.content instanceof stream.Readable;

    if (!args.path || args.content == null) throw "Need 'path' and 'content'";
    if (args.base64 && !isStream) args.content = base64.atob(args.content);

    return workspace.path(args.path)
    .then(function(_path) {
        if (!args.override && fs.existsSync(_path)) throw "File already exists";

        // Write parent folder
        if (args.createParent) {
            var parent = path.dirname(_path);
            wrench.mkdirSyncRecursive(parent, 0777);
        }

        // Write stream
        if (isStream) {
            var d = Q.defer();
            var writeStream = fs.createWriteStream(_path);

            args.content.on("end", function() {
                d.resolve();
            });

            writeStream.on("error", function(err) {
                d.reject(err);
            });

            var s = args.content;

            if (args.base64) s = s.pipe(base64Stream.decode());

            s.pipe(writeStream);

            return d.promise;
        } else {
            return Q.nfcall(fs.writeFile, _path, args.content);
        }
    })
    .thenResolve({});
};

// Create a file
var create = function(args) {
    if (!args.path) throw "Need 'path'";
    if (args.name) args.path = path.join(args.path, args.name);

    return write({
        'path': args.path,
        'override': false,
        'content': "",
        'base64': false
    })
    .then(function() {
        return stat({
            'path': args.path
        });
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
    if (!args.from || (!args.to && !args.name)) throw "Need 'from' and 'to'";
    if (args.name) args.to = path.join(path.dirname(args.from), args.name);

    return Q.all([
        workspace.path(args.from),
        workspace.path(args.to)
    ])
    .spread(function(from, to) {
        if (from == workspace.root() || to == workspace.root()) throw "Cannot use root folder";
        if (from == to) throw "'from' is equal to 'to'";
        if (fs.existsSync(to)) throw "Already exists";

        return Q.nfcall(fs.rename, from, to);
    })
    .then(function(r) {
        return stat({ path: args.to });
    });
};

// Upload a file
var upload = function(args, meta) {
    args.path = args.path || ".";
    return _.reduce(meta.req.files, function(prev, file) {
        return prev
        .then(function() {
            return write(_.extend({}, args, {
                'path': path.join(args.path, file.filename),
                'base64': args.base64? true : false,
                'content': fs.createReadStream(file.path)
            }));
        });
    }, Q());
};

module.exports = {
    'stat': stat,
    'list': list,
    'read': read,
    'write': write,
    'remove': remove,
    'mkdir': mkdir,
    'create': create,
    'rename': rename,
    'upload': upload
};
