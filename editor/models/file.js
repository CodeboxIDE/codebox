var Q = require("q");
var _ = require("hr.utils");
var Model = require("hr.model");
var logger = require("hr.logger")("files");

var rpc = require("../core/rpc");
var commands = require("../core/commands");
var events = require("../core/events");
var hash = require("../utils/hash");
var dialogs = require("../utils/dialogs");

var File = Model.extend({
    defaults: {
        path: null,
        name: null,
        directory: false,
        size: 0,
        mtime: 0,
        atime: 0,
        buffer: null,
        mime: "text/plain"
    },
    idAttribute: "name",

    // Initialize
    initialize: function() {
        File.__super__.initialize.apply(this, arguments);

        this.options = _.defaults(this.options, {
            saveAsFile: true
        });

        this.listenTo(events, "e:fs:modified", _.partial(this._dispatchFsEvent, "modified"));
        this.listenTo(events, "e:fs:deleted", _.partial(this._dispatchFsEvent, "deleted"));
        this.listenTo(events, "e:fs:created", _.partial(this._dispatchFsEvent, "created"));
    },

    // Dispatch fs event
    _dispatchFsEvent: function(type, paths) {
        var path, childs;

        if (this.isBuffer()) return;

        path = this.get("path");
        if (_.contains(paths,  path)) {
            this.trigger("fs:"+type);
        }
        if (this.isDirectory()) {
            childs = _.filter(paths, this.isChild, this);
            if (childs.length > 0) {
                this.trigger("fs:files:"+type);
            }
        }
    },

    // Open this file
    open: function() {
        return commands.run("file.open."+this.getExtension().slice(1), {
            path: this.get("path")
        });
    },

    // Check if is a directory
    isDirectory: function() {
        return this.get("directory");
    },

    // Check if a file is a buffer or exists
    isBuffer: function() {
        return _.isString(this.get("buffer"));
    },

    // Test if a path is child
    isChild: function(path) {
        var parts1 = _.filter(path.split("/"), function(p) { return p.length > 0; });
        var parts2 = _.filter(this.get("path").split("/"), function(p) { return p.length > 0; });
        return (parts1.length == (parts2.length+1));
    },

    // List files in this directory
    list: function() {
        return rpc.execute("fs/list", {
            'path': this.get("path")
        })
        .then(function(files) {
            return _.map(files, function(file) {
                return new File({}, file);
            });
        });
    },

    // Get a specific file
    stat: function(path) {
        var that = this;

        return rpc.execute("fs/stat", {
            'path': path
        })
        .then(function(file) {
            that.del("buffer", { silent: true });
            return that.set(file);
        })
        .thenResolve(that);
    },

    // Read file content
    read: function(opts) {
        opts = _.defaults(opts || {}, {
            base64: false
        });

        var p;

        if (this.isBuffer()) p = Q(hash.btoa(this.get("buffer")));
        else {
            p = rpc.execute("fs/read", {
                'path': this.get("path")
            })
            .get("content");
        }

        if (!opts.base64) p = p.then(hash.atob);

        return p;
    },

    // Access url
    accessUrl: function() {
        return "/fs/"+this.get("path");
    },

    // Write file content
    write: function(content, opts) {
        var that = this;
        opts = _.defaults(opts || {}, {
            base64: false
        });

        return opts.base64? Q(content) : File.btoa(content)
        .then(function(_content) {
            if (that.isBuffer()) return Q(that.set("buffer", hash.atob(content)));

            return rpc.execute("fs/write", {
                'path': that.get("path"),
                'content': content
            });
        })
        .then(function() {
            that.trigger("write", content);
        });
    },

    // Rename
    rename: function(name) {
        var that = this;
        if (this.isBuffer()) return Q();

        return rpc.execute("fs/rename", {
            'from': this.get("path"),
            'name': name
        })
        .then(function(f) {
            that.set(f);
        });
    },

    // Remove this file
    remove: function() {
        if (this.isBuffer()) return Q(this.destroy());

        return rpc.execute("fs/remove", {
            'path': this.get("path")
        })
        .then(this.destroy.bind(this));
    },

    // Create a file in this folder
    create: function(name) {
        return File.create(this.get("path"), name);
    },

    // Create a folder in this folder
    mkdir: function(name) {
        return File.mkdir(this.get("path"), name);
    },

    // Get by extension
    getExtension: function() {
        return "."+this.get("name").split('.').pop();
    },

    // Save file
    save: function(content, opts) {
        var that = this;

        return File.btoa(content)
        .then(function(_content) {
            if (!that.isBuffer() || !that.options.saveAsFile) return that.write(_content, { base64: true });

            return dialogs.prompt("Save as:", that.get("name"))
            .then(function(_path) {
                return rpc.execute("fs/write", {
                    'path': _path,
                    'content': _content,
                    'override': false
                })
                .then(function() {
                    return that.stat(_path);
                })
                .fail(dialogs.error);
            });
        });
    }
}, {
    // Get a specific file
    get: function(path) {
        var f = new File();

        return f.stat(path);
    },

    // Create a file buffer
    buffer: function(name, content, id, options) {
        var f = new File(options || {}, {
            'name': name,
            'buffer': content || "",
            'path': "buffer://"+(id || _.uniqueId("tmp")),
            'directory': false
        });

        return f;
    },

    // Create a new file
    create: function(path, name) {
        return rpc.execute("fs/create", {
            'path': path,
            'name': name
        })
        .then(function(f) {
            return new File({}, f);
        });
    },

    // Create a new folder
    mkdir: function(path, name) {
        return rpc.execute("fs/mkdir", {
            'path': path,
            'name': name
        })
        .then(function(f) {
            return new File({}, f);
        });
    },

    // Save as
    saveAs: function(filename, content, opts) {
        var f = File.buffer(filename);
        return f.save(content, opts);
    },

    // Convert string or blob to base64
    btoa: function(b) {
        var d = Q.defer();

        if (b instanceof Blob) {
            var reader = new window.FileReader();
            reader.readAsDataURL(b);
            reader.onerror = function(err) {
                d.reject(err);
            }
            reader.onloadend = function() {
                d.resolve(reader.result);
            };
        } else {
            try {
                d.resolve(hash.btoa(b));
            } catch (e) {
                d.reject(e);
            }
        }

        return d.promise;
    }
});

module.exports = File;
