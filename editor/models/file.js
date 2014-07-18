define([
    "hr/hr",
    "hr/utils",
    "hr/promise",
    "core/rpc",
    "core/commands"
], function(hr, _, Q, rpc, commands) {
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
            .get("content");
        },

        // Write file content
        write: function(content) {
            if (this.isBuffer()) return Q(this.set("buffer", content));

            return rpc.execute("fs/write", {
                'path': this.get("path"),
                'content': content
            });
        }
    }, {
        // Get a specific file
        get: function(path) {
            var f = new File();

            return f.stat(path);
        }
    });

    return File;
});