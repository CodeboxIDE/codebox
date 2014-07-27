define([
    "hr/hr",
    "hr/utils",
    "hr/promise",
    "core/rpc",
    "core/commands",
    "core/events",
    "utils/hash"
], function(hr, _, Q, rpc, commands, events, hash) {
    var File = hr.Model.extend({
        defaults: {
            path: null,
            name: null,
            directory: false,
            size: 0,
            mtime: 0,
            atime: 0,
            buffer: null
        },
        idAttribute: "name",

        // Initialize
        initialize: function() {
            File.__super__.initialize.apply(this, arguments);

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
                if (type == "deleted") return this.destroy();
                this.trigger("fs:modified");
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
            return commands.run("file.open", {
                path: this.get("path")
            });
        },

        // Check if is a directory
        isDirectory: function() {
            return this.get("directory");
        },

        // Check if a file is a buffer or exists
        isBuffer: function() {
            return this.get("buffer") != null;
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
                return that.set(file);
            })
            .thenResolve(that);
        },

        // Read file content
        read: function() {
            if (this.isBuffer()) return Q(this.get("buffer"));

            return rpc.execute("fs/read", {
                'path': this.get("path")
            })
            .get("content")
            .then(hash.atob);
        },

        // Write file content
        write: function(content) {
            var that = this;

            return Q()
            .then(function() {
                if (that.isBuffer()) return Q(that.set("buffer", content));

                return rpc.execute("fs/write", {
                    'path': that.get("path"),
                    'content': hash.btoa(content)
                });
            })
            .then(function() {
                that.trigger("write", content);
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
        }
    }, {
        // Get a specific file
        get: function(path) {
            var f = new File();

            return f.stat(path);
        },

        // Create a file buffer
        buffer: function(name, content, id) {
            var f = new File({}, {
                'name': name,
                'buffer': content,
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
        }
    });

    return File;
});