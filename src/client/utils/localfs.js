define([
    'underscore',
    'hr/hr',
    'utils/url',
    'vendors/filer',
    'core/operations'
], function(_, hr, Url, Filer, operations) {
    var logger = hr.Logger.addNamespace("localfs");

    var base = "/";

    // Create fs interface
    var filer = new Filer();

    var fsCall = function(method, args, context) {
        if (_.isUndefined(args)) args = [];
        if (!_.isArray(args)) args = [args];

        var d = Q.defer();
        args.push(function() {
            if (arguments.length == 1) return d.resolve(arguments[0]);
            d.resolve(arguments);
        });
        args.push(function(err) {
            logger.error("Error occurs: ", err);
            d.reject(err);
        })

        method.apply(context, args);

        return d.promise;
    };

    /*
     *  Init the localfs
     */
    var initFs = function(baseDir) {
        base = "/"+baseDir;
        return fsCall(filer.init, {
            persistent: true,
            size: 10 * 1024 * 1024
        }, filer).then(function() {
            if (base!= "/") return createDirectory("/");
            return Q();
        }).then(function() {
            logger.log("ready");
        });
    };

    /*
     * Adapt path
     */
    var adaptPath = function(path) {
        path = base+path;
        path = path.replace("//", "/");
        return path;
    }

    /*
     *  Convert a vfs url in a path
     */
    var urlToPath = function(url) {
        var path = url.replace("/vfs/", "");
        if (path.length == 0) path = '/';
        if (path[0] != '/') path = "/" + path;
        return path;
    };

    /*
     *  Return informations about a fileentry
     */
    var getEntryInfos = function(fEntry) {
        return fsCall(fEntry.getMetadata, [], fEntry).then(function(metadata) {
            var url = location.protocol+"//"+location.host+"/vfs"+fEntry.fullPath.replace(base, "/");

            if (fEntry.isDirectory) url = url + "/";

            return {
                "name": fEntry.name,
                "size": metadata.size,
                "mtime": metadata.modificationTime.getTime(),
                "mime": fEntry.isDirectory ? "inode/directory" : "application/octet-stream",
                "href": url,
                "exportUrl": fEntry.toURL(),
                "offline": true
            };
        })
    };

    /*
     *  List a directory
     */
    var listDir = function(path) {
        path = adaptPath(path);

        logger.log("ls:", path);
        return fsCall(filer.ls, path, filer).then(function(entries) {
            return Q.all(_.map(entries, function(entry) {
                return getEntryInfos(entry);
            }))
        }).then(function(entries) {
            logger.log(entries);
            return entries;
        }, function(err) {
            logger.error("ls:", err);
        });
    };

    /*
     *  Create a file
     */
    var createFile = function(path) {
        path = adaptPath(path);
        logger.log("create:", path);
        return fsCall(filer.create, [path, true], filer);
    };

    /*
     *  Write file
     */
    var writeFile = function(path, data) {
        path = adaptPath(path);
        logger.log("write:", path);
        return fsCall(filer.write, [path, {
            'data': data || ""
        }], filer);
    };

    /*
     *  Read a file
     */
    var readFile = function(path) {
        path = adaptPath(path);
        logger.log("read:", path);
        return fsCall(filer.open, [path], filer).then(function(file) {
            var d = Q.defer();

            var reader = new FileReader();
            reader.onerror = function(err) {
                d.reject(err);
            };
            reader.onload = function(e) {
                d.resolve(this.result);
            };
            reader.readAsText(file);

            return d.promise;
        });
    };

    /*
     *  Create a file
     */
    var createDirectory = function(path) {
        path = adaptPath(path);
        logger.log("mkdir:", path);
        return fsCall(filer.mkdir, [path, false], filer);
    };

    /*
     *  Move a file
     */
    var move = function(from, to) {
        from = adaptPath(from);
        to = adaptPath(to);

        logger.log("move:", from, "to", to);
        return fsCall(filer.mv, [from, '.', to], filer);
    };

    /*
     *  Remove a file or directory
     */
    var remove = function(path) {
        path = adaptPath(path);

        logger.log("remove:", path);
        return fsCall(filer.rm, [path], filer);
    };

    /*
     *  Sync a file in the box fs with the local fs
     *
     *  this will download the files and saved them in the localfs
     */
    var syncFileBoxToLocal = function(file) {
        var doSync = function(fp) {
            var path = fp.path();
            logger.log("sync:", path);

            if (fp.isDirectory()) {
                // Create the directory
                return createDirectory(path).then(function() {
                    // List subfiles
                    return fp.listdir();
                }).then(function(files) {
                    // Recursively sync files and directory
                    return Q.all(_.map(files, function(f) {
                        return doSync(f);
                    }));
                });
            } else {
                // Read file content
                return fp.read().then(function(content) {
                    // Write file content
                    return writeFile(path, content);
                });
            }
        };
        return operations.start("files.sync.offline", function(op) {
            return remove(file.path()).then(function() {
                doSync(file);
            }, function() {
                doSync(file);
            });
        }, {
            title: "Syncing "+this.path()
        });
    };

    /*
     *
     */

    return {
        'getEntryInfos': getEntryInfos,
        'urlToPath': urlToPath,
        'init': initFs,
        'ls': listDir,
        'create': createFile,
        'mkdir': createDirectory,
        'write': writeFile,
        'read': readFile,
        'mv': move,
        'rm': remove,
        'syncTo': syncFileBoxToLocal
    };
});