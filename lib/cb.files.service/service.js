// Requires
var _ = require('underscore');
var es = require('event-stream');


function FilesService(vfs) {
    // Bind methods
    _.bindAll(this);

    this.vfs = vfs;

    this.docMap = {};
}

FilesService.prototype.invoke = function(methodName, callback) {
    this[methodName].apply(
        null,
        _.toArray(arguments).slice(1)
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
FilesService.prototype.open = function(path, userId) {
    return this.can(path, userId);
};

FilesService.prototype.close = function(path, userId) {
    return this.can(path, userId);
};

// Read & Write
FilesService.prototype.read = function(path, userId) {

};

FilesService.prototype.write = function(path, content, userId) {
    var stream = es.through();

    // Write file's contents to stream
    stream.write(content);

    return Q.nfcall(this.vfs.mkfile, {
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
