define([
    'hr/utils',
    'hr/hr',
    'utils/url',
    'core/localfs'
], function(_, hr, Url, localfs) {
    var logger = hr.Logger.addNamespace("vfs");

    // Create backend
    var vfs = new hr.Backend({
        prefix: "vfs"
    });

    // Emulate a vfs event
    var triggerWatchEvent = function(name, path, data) {
        var eventName = "watch.change."+name;
        vfs.trigger("event:"+eventName, {
            'event': eventName,
            'data': _.extend({}, {
                'path': path,
                'change': name,
                'source': "fakeVfs"
            }, data)
        });
    };

    // Refresh all vfs when offlien change
    hr.Offline.on("state", function() {
        triggerWatchEvent("folder", "/");
    });

    // Map vfs method -> http request method
    var methodsMap = {
        "listdir": "getJSON",
        "write": "put",
        "mkdir": "put",
        "create": "put",
        "special": "post",
        "remove": "delete",
        "read": "get"
    };

    // Base method when connection is on
    vfs.defaultMethod({
        execute: function(args, options, method) {
            if (args && method != "write") args = JSON.stringify(args);
            if (!options.url) return Q.reject(new Error("VFS requests need 'url' option"));
            if (!methodsMap[method]) return Q.reject(new Error("Invalid VFS request: "+method));

            logger.log(method+": "+options.url);
            return hr.Requests[methodsMap[method]](options.url, args, options);
        },
        after: function(args, results, options, method) {
            var path = localfs.urlToPath(options.url);
            switch (method) {
                case "remove":
                    triggerWatchEvent("delete", path);
                    break;
                case "special":
                    // Rename
                    if (args.renameFrom) {
                        triggerWatchEvent("delete", args.renameFrom);
                        triggerWatchEvent("create", path);
                    } else if (args.copyFrom){
                        triggerWatchEvent("create", path);
                    }
                    
                    break;
                case "create":
                    triggerWatchEvent("create", path);
                    break;
                case "mkdir":
                    triggerWatchEvent("create", path);
                    break;
                case "write":
                    triggerWatchEvent("update", path);
                    break;
            }
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
    vfs.addMethod('special', {
        fallback: function(args, options) {
            // Rename
            if (args.renameFrom) {
                var to = localfs.urlToPath(options.url);
                var from = args.renameFrom;

                if (!from) return Q.reject("need 'renameFrom'");
                return localfs.mv(from, to);
            }
            // Copy
            else if (args.copyFrom) {
                var to = localfs.urlToPath(options.url);
                var from = args.copyFrom;

                if (!from) return Q.reject("need 'copyFrom'");
                return localfs.cp(from, to);
            } else {
                return Q.reject("Invalid special operations");
            }
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