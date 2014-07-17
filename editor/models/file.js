define([
    "hr/hr",
    "hr/utils",
    "core/rpc"
], function(hr, _, rpc) {
    var File = hr.Model.extend({
        defaults: {
            path: null,
            name: null,
            directory: false,
            size: 0,
            mtime: 0,
            atime: 0
        },
        idAttribute: "name",

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