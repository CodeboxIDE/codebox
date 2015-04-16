var path = require("path");
var axios = require("axios");
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

        return Q()
        .then(function() {
            if (that.isBuffer()) {
                return File.blobToString(content)
                .then(function(s) {
                    that.set("buffer", s);
                });
            }

            return File.writeContent(that.get("path"), content);
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

        return Q()
        .then(function() {
            if (!that.isBuffer() || !that.options.saveAsFile) return that.write(content, opts);

            return dialogs.prompt("Save as:", that.get("name"))
            .then(function(filename) {
                return File.writeContent(filename, content, {
                    'override': false
                })
                .then(function() {
                    return that.stat(filename);
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

    // Convert blob to string
    blobToString: function(b) {
        var d = Q.defer();

        if (b instanceof Blob) {
            var reader = new window.FileReader();
            reader.onerror = function(err) {
                d.reject(err);
            }
            reader.onload = function() {
                d.resolve(reader.result);
            };
            reader.readAsText(b);
        } else {
            d.resolve(b);
        }

        return d.promise;
    },

    // Write content to a file (blob, arraybuffer, string)
    writeContent: function(filename, content, opts) {
        opts = _.defaults(opts || {}, {
            base64: false
        });
        var useUpload = false;

        return Q()
        .then(function() {
            if (_.isString(content)) {
                if (opts.base64) return content;

                useUpload = (content.length > 1000);
                opts.base64 = true;
                return hash.btoa(content);
            } else {
                useUpload = true;
                return content;
            }
        })
        .then(function(_content) {
            if (useUpload) {
                opts.path = path.dirname(filename);

                var data = new FormData();
                var blob = new Blob([_content]);

                _.each(opts, function(value, key) {
                    data.append(key, JSON.stringify(value));
                });
                data.append("content", blob, path.basename(filename));

                return Q(axios.put('/rpc/fs/upload', data));
            } else {
                opts.path = filename;
                opts.content = _content;
                return rpc.execute("fs/write", opts);
            }
        });
    }
});

module.exports = File;
