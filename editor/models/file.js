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

            this.listenTo(events, "e:fs", function(e) {
                if (this.isBuffer() || e != this.get("path")) return;
            });
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
            if (this.isBuffer()) return Q(this.set("buffer", content));

            return rpc.execute("fs/write", {
                'path': this.get("path"),
                'content': hash.btoa(content)
            });
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
        }
    });

    return File;
});