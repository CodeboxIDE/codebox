define([
    'underscore',
    'hr/hr',
    'utils/url',
    'core/localfs'
], function(_, hr, Url, localfs) {
    var logger = hr.Logger.addNamespace("vfs");

    // Create backend
    var vfs = new hr.Backend({
        prefix: "vfs"
    });

    // Map vfs method -> http request method
    var methodsMap = {
        "listdir": "getJSON",
        "write": "put",
        "mkdir": "put",
        "create": "put",
        "rename": "post",
        "remove": "delete",
        "read": "get"
    };

    // Base method when connexion is on
    vfs.addMethod('*', {
        execute: function(args, options, method) {
            if (args && method != "write") args = JSON.stringify(args);
            if (!options.url) return Q.reject(new Error("VFS requests need 'url' option"));
            if (!methodsMap[method]) return Q.reject(new Error("Invalid VFS request: "+method));

            logger.log(method+": "+options.url);
            return hr.Requests[methodsMap[method]](options.url, args, options);
        }
    });

    // Read a file content
    vfs.addMethod('read', {
        fallback: function(args, options) {
            var path = localfs.urlToPath(options.url);
            return localfs.read(path);
        },
        after: function(args, results, options) {
            
        }
    });

    // Create a new file
    vfs.addMethod('create', {
        fallback: function(args, options) {
            var path = localfs.urlToPath(options.url);
            return localfs.create(path, args);
        },
        after: function(args, results, options) {
            localfs.autoSync();
        }
    });

    // Create a new directory
    vfs.addMethod('mkdir', {
        fallback: function(args, options) {
            var path = localfs.urlToPath(options.url);
            return localfs.mkdir(path, args);
        },
        after: function(args, results, options) {
            localfs.autoSync();
        }
    });

    // Write a file content
    vfs.addMethod('write', {
        fallback: function(args, options) {
            var path = localfs.urlToPath(options.url);
            return localfs.write(path, args);
        },
        after: function(args, results, options) {
            localfs.autoSync();
        }
    });

    // Rename a file
    vfs.addMethod('rename', {
        fallback: function(args, options) {
            var to = localfs.urlToPath(options.url);
            var from = args.renameFrom;

            if (!from) return Q.reject("need 'renameFrom'");
            return localfs.mv(from, to);
        },
        after: function(args, results, options) {
            localfs.autoSync();
        }
    });

    // Remove a file or directory
    vfs.addMethod('remove', {
        fallback: function(args, options) {
            var path = localfs.urlToPath(options.url);
            return localfs.rm(path, args);
        },
        after: function(args, results, options) {
            localfs.autoSync();
        }
    });

    // List a directory
    vfs.addMethod('listdir', {
        fallback: function(args, options) {
            var path = localfs.urlToPath(options.url);
            return localfs.ls(path);
        },
        after: function(args, results, options) {
            
        }
    });

    return vfs;
});