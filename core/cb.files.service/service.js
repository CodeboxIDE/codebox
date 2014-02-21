// Requires
var Q = require('q');
var _ = require('lodash');
var es = require('event-stream');


function FilesService(vfs, events) {
    // Bind methods
    _.bindAll(this);

    this.vfs = vfs;
    this.events = events;

    this.docMap = {};
}

FilesService.prototype.invoke = function(methodName) {
    var args = _.toArray(arguments);
    var callback = args[args.length - 1];
    this[methodName].apply(
        null,
        args.slice(1)
    )
    .then(_.partial(callback, null))
    .fail(callback);
};

// Permission lookup
FilesService.prototype.can = function(path, userId, perm) {
    perm = perm || 'rw';

    // Check permissions in someway

    return Q(true);
};

// Open & Close
FilesService.prototype.open = function(path, userId, token) {
    this.events.emit('files.open', {
        path: path,
        userId: userId
    });
    return this.can(path, userId);
};

FilesService.prototype.close = function(path, userId) {
    this.events.emit('files.close', {
        path: path,
        userId: userId
    });
    return this.can(path, userId);
};

// Read & Write
FilesService.prototype.read = function(path, userId) {
    var d = Q.defer();

    this.events.emit('files.read', {
        path: path,
        userId: userId
    });

    Q.nfcall(this.vfs.readfile, path, {})
    .then(function(meta) {
        var stream = meta.stream;

        // Buffers
        var bufs = [];
        stream.on('data', function(buf) {
            bufs.push(buf);
        });
        stream.on('end', function() {
            return d.resolve(Buffer.concat(bufs).toString());
        });

    })
    .fail(d.reject);

    return d.promise;
};

FilesService.prototype.write = function(path, content, userId) {
    var stream = es.through();

    this.events.emit('files.write', {
        path: path,
        userId: userId
    });

    // Write file's contents to stream
    setTimeout(function() {
        // Write in next event tick
        // so the stream can be piped etc ...
        stream.write(content);
        stream.end();
    }, 0);

    return Q.nfcall(this.vfs.mkfile, path, {
        stream: stream,

        // Create parent directories if needed
        parents: true
    })
    .then(function() {
        // Close stream
        stream.end();
        return true;
    })
    .fail(Q(false));
};

// Exports
exports.FilesService = FilesService;
