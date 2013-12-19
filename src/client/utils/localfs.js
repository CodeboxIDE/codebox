define([
    'underscore',
    'hr/hr',
    'utils/url',
    'vendors/filer',
    'core/operations'
], function(_, hr, Url, Filer, operations) {
    var logger = hr.Logger.addNamespace("localfs");

    var base = "/";
    var MIME_DIRECTORY = "inode/directory";

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
                "mime": fEntry.isDirectory ? MIME_DIRECTORY : "application/octet-stream",
                "href": url,
                "exportUrl": fEntry.toURL(),
                "offline": true,
                '_fullPath': fEntry.fullPath
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
     *  Open a file
     */
    var openFile = function(path) {
        path = adaptPath(path);
        logger.log("open:", path);
        return fsCall(filer.open, [path], filer);
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
     *  Sync localfs to vfs
     */
    var syncFileLocalToBox = function() {
        var File = require("models/file");
        var box = require("core/box");

        var doSyncDir = function(path, parent) {
            var localEntries, boxEntries, currentEntryInfos;

            // Get current directory
            return openFile(path).then(function(fEntry) {
                // Get infos about current diretcory
                return getEntryInfos(fEntry);
            }).then(function(infos) {
                // Infos about this entry
                currentEntryInfos = infos;

                return listdir(path);
            }).then(function(entries) {
                // Entry in the browser
                localEntries = entries;
                return parent.listdir();
            }).then(function(entries) {
                // Entries on the boxes
                boxEntries = entries;
            }).then(function() {
                // Eliminate old useless entries
                return Q.all(_.map(boxEntries, function(boxFile) {
                    var localEntry = _.find(localEntries, function(localEntry) {
                        return localEntry.name == boxFile.get("name");
                    });

                    // File don't exists and box file older than current directory
                    if (!localEntry && boxFile.get("mtime") < currentEntryInfos.mtime) {
                        // -> Remove the file on the box
                        logger.log("resync: need to remove ", boxFile.path());
                        return boxFile.remove();
                    }

                    // Do nothing
                    return Q();
                }));
            }).then(function() {
                // Update entries and create new entries
                return Q.all(_.map(localEntries, function(localEntry) {
                    var entryIsDir = localEntry.mime != MIME_DIRECTORY;
                    var boxFile = _.find(boxEntries, function(boxFile) {
                        return localEntry.name == boxFile.get("name");
                    });

                    // Is not a directory and:
                    if (entryIsDir && (!boxFile    // File don't exist
                    || (boxFile.get("mtime") < localEntry.mtime)))    // or File modified offline
                    {
                        // -> Update box content
                        logger.log("resync: need to update ", localEntry._fullPath);
                        return read(localEntry._fullPath).then(function(content) {
                            return parent.write(content, localEntry._fullPath);
                        });
                    }

                    // if a directory
                    if (entryIsDir) {
                        logger.log("resync: is a directory", localEntry._fullPath);

                        var syncEntry = function(newParent) {
                            logger.log("resync: go sync ", newParent.path(), localEntry._fullPath);
                            return doSyncDir(localEntry._fullPath, newParent);
                        }

                        var createAndSyncEntry = function() {
                            logger.log("resync: need to mkdir", localEntry.name, "in", parent.path());
                            return parent.mkdir(localEntry.name).then(function() {
                                return parent.getChild(localEntry.name);
                            }).then(syncEntry);
                        }

                        if (boxFile) {
                            if (boxFile.isDirectory()) {
                                return syncEntry(boxFile);
                            } else {
                                return boxFile.remove().then(createAndSyncEntry);
                            }
                        } else {
                            return createAndSyncEntry;
                        }
                    }

                    // Do nothing
                    return Q();
                }));
            });
        };

        return operations.start("files.sync.online", function(op) {
            return doSyncDir("/", box.root)
        }, {
            title: "Updating "+this.path()
        });
    };

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