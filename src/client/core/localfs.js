define([
    'underscore',
    'hr/hr',
    'utils/url',
    'vendors/filer',
    'core/operations',
    'utils/dialogs',
    'utils/alerts',
    'collections/changes'
], function(_, hr, Url, Filer, operations, dialogs, alerts, Changes) {
    var logger = hr.Logger.addNamespace("localfs");

    // Base folder for localfs
    var base = "/";
    var _isInit = false;
    var _syncIsEnable = false;
    var changes = new Changes();

    // Constant mime type for a directory
    var MIME_DIRECTORY = "inode/directory";

    // Duration for sync (ms)
    syncDuration = 1*60*1000;


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
            logger.error("Error occurs: ", method.name, err);
            d.reject(err);
        })

        try {
            method.apply(context, args);
        } catch(err) {
            d.reject(err);
        }

        return d.promise;
    };

    /*
     *  Init the localfs
     */
    var initFs = function(baseDir) {
        base = "/"+baseDir;
        return Q();
    };

    var enableSync = function() {
        _syncIsEnable = true;
    };

    var prepareFs = function() {
        if (_isInit) return Q();
        return fsCall(filer.init, {
            persistent: true,
            size: 10 * 1024 * 1024
        }, filer).then(function() {
            logger.log("fs is ready");
            _isInit = true;
            return Q();
        });
    };

    var needFsReady = function(fn) {
        return function() {
            var args = arguments;
            return prepareFs().then(function() {
                return fn.apply(fn, args);
            });
        };
    }

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
    var getEntryInfos = needFsReady(function(fEntry) {
        return fsCall(fEntry.getMetadata, [], fEntry).then(function(metadata) {
            var path = fEntry.fullPath.replace(base, "/").replace("//", "/");
            var url = location.protocol+"//"+location.host+"/vfs"+path;

            if (fEntry.isDirectory) url = url + "/";

            return {
                "name": fEntry.name,
                "size": metadata.size,
                "mtime": metadata.modificationTime.getTime(),
                "mime": fEntry.isDirectory ? MIME_DIRECTORY : "application/octet-stream",
                "href": url,
                "exportUrl": fEntry.toURL(),
                "offline": true,
                '_fullPath': path
            };
        })
    });

    /*
     *  List a directory
     */
    var listDir = needFsReady(function(path) {
        path = adaptPath(path);

        logger.log("ls:", path);
        return fsCall(filer.ls, path, filer).then(function(entries) {
            return Q.all(_.map(entries, function(entry) {
                return getEntryInfos(entry);
            }))
        }).then(function(entries) {
            return entries;
        }, function(err) {
            logger.error("ls:", err);
        });
    });

    /*
     *  Create a file
     */
    var createFile = needFsReady(function(path) {
        path = adaptPath(path);
        logger.log("create:", path);
        return fsCall(filer.create, [path, true], filer);
    });

    /*
     *  Write file
     */
    var writeFile = needFsReady(function(path, data) {
        path = adaptPath(path);
        logger.log("write:", path);
        return fsCall(filer.write, [path, {
            'data': data || ""
        }], filer);
    });

    /*
     *  Open a file
     */
    var openFile = needFsReady(function(path) {
        path = adaptPath(path);
        logger.log("open:", path);
        return fsCall(filer.getEntry, [path], filer).then(function(fEntry) {
            return getEntryInfos(fEntry);
        })
    });

    /*
     *  Read a file
     */
    var readFile = needFsReady(function(path) {
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
    });

    /*
     *  Create a file
     */
    var createDirectory = needFsReady(function(path) {
        path = adaptPath(path);
        logger.log("mkdir:", path);
        return fsCall(filer.mkdir, [path, false], filer);
    });

    /*
     *  Move a file
     */
    var move = needFsReady(function(from, to) {
        from = adaptPath(from);
        to = adaptPath(to);

        logger.log("move:", from, "to", to);
        return fsCall(filer.mv, [from, '.', to], filer);
    });

    /*
     *  Remove a file or directory
     */
    var remove = needFsReady(function(path) {
        path = adaptPath(path);

        logger.log("remove:", path);
        return fsCall(filer.rm, [path], filer);
    });

    /*
     *  Return changes
     */
    var getChanges = needFsReady(function() {
        var File = require("models/file");
        var box = require("core/box");
        changes.reset([]);

        if (!_syncIsEnable) return Q(changes);

        var addChange = function(path, type, args) {
            logger.log("change:",type,path);
            changes.add(_.extend(args || {}, {
                'path': path,
                'time': Date.now(),
                'type': type || "M"
            }));
        }

        var getDirChanges = function(path) {
            var localEntries, boxEntries, currentEntryInfos, fp;
            if (path == "/.git") return Q();

            logger.log("get changes in:", path);

            // File in the workspace
            fp = new File();

            return openFile(path).then(function(infos) {
                return listDir(path);
            }).then(function(entries) {
                // Entry in the browser
                localEntries = entries;

                // Get file on the workspace
                return fp.getByPath(path).fail(function() {
                    return Q();
                });
            }).then(function() {
                if (fp.isDirectory()) {
                    return fp.listdir();
                }
                return Q([]);
            }).then(function(entries) {
                // Entries on the boxes
                boxEntries = entries;
            }).then(function() {
                // Eliminate old useless entries
                return Q.all(_.map(boxEntries, function(boxFile) {
                    if (boxFile.path() == "/.git") return Q();

                    var localEntry = _.find(localEntries, function(localEntry) {
                        return localEntry.name == boxFile.get("name");
                    });

                    // File don't exists and box file older than current directory
                    if (!localEntry && boxFile.get("mtime") < currentEntryInfos.mtime) {
                        // -> Remove the file on the box
                        addChange(boxFile.path(), "remove");
                    }

                    // Do nothing
                    return Q();
                }));
            }).then(function() {
                // Update entries and create new entries
                return Q.all(_.map(localEntries, function(localEntry) {
                    var entryIsDir = localEntry.mime == MIME_DIRECTORY;
                    var boxFile = _.find(boxEntries, function(boxFile) {
                        return localEntry.name == boxFile.get("name");
                    });

                    if (!boxFile) {
                        // Create file
                        if (!entryIsDir) {
                            addChange(localEntry._fullPath, "create");
                        } else {
                            addChange(localEntry._fullPath, "mkdir");
                        }
                    } else if (!entryIsDir && boxFile.get("mtime") < localEntry.mtime) {
                        // Check modification
                        return readFile(localEntry._fullPath).then(function(content) {
                            return boxFile.read().then(function(vfsContent) {
                                if (vfsContent == content) {
                                    // Same content
                                    return Q();
                                }
                                addChange(localEntry._fullPath, "write", {
                                    'content': content
                                });
                            })
                        });
                    }

                    if (entryIsDir) {
                        return getDirChanges(localEntry._fullPath);
                    }

                    // Do nothing
                    return Q();
                }));
            }).fail(function(err) {
                logger.error("Error during sync: ", err);
            });
        };

        return operations.start("files.sync.changes", function(op) {
            return getDirChanges("/").then(function() {
                return Q(changes);
            });
        }, {
            title: "Calculating changes ..."
        });
    });

    /*
     *  Sync a file in the box fs with the local fs
     *
     *  this will download the files and saved them in the localfs
     */
    var syncFileBoxToLocal = needFsReady(function() {
        var box = require("core/box");

        if (!_syncIsEnable) return Q(false);

        var doSync = function(fp) {
            var path = fp.path();
            if (path == "/.git") return Q();

            logger.log("sync:box->local:", path);

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
        return operations.start("files.sync.download", function(op) {
            logger.warn("Start sync: box->local");
            return remove("/").then(function() {
                return doSync(box.root);
            }, function() {
                return doSync(box.root)
            }).then(function() {
                changes.reset([]);
                alerts.show("Workspace has been saved offline.", 5000);
                logger.warn("Finished sync: box->local");
            });
        }, {
            title: "Downloading ..."
        });
    });

    /*
     *  Global sync:
     *      -> if never sync: download everything
     *      -> if already sync: upload changes and download last changes
     */
    var sync = needFsReady(function(options) {
        options = _.defaults({}, options || {}, {

        });

        if (!_syncIsEnable) return Q.reject(new Error("Offline sync is not enable"));

        var previousChanges = changes.size();

        if (hr.Offline.isConnected()) {
            var endT, startT = Date.now();
            return openFile("/").then(function(infos) {
                return getChanges();
            }, function() {
                return createDirectory("/");
            }).then(function() {
                if (changes.size() > 0) {
                    if (changes.size() == previousChanges) return Q.reject(new Error("Offline changes not synced"));
                    return dialogs.alert("Offline changes", "There are "+changes.size()+" changes made offline that need to be synced manually, use the 'Changes' menu to do so. You can also reset the offline cache using the 'Synchronize' menu.").then(function() {
                        return Q.reject(new Error("Offline changes not synced"));
                    })
                }
                return syncFileBoxToLocal();
            }).then(function() {
                //Calcul duration
                endT = Date.now();
                syncDuration = _.max([endT - startT, 5000]);
                updateAutoSync();

                alerts.show("Offline and Workspace have been synchronized.", 5000);
                return syncDuration;
            }, function(err) {
                logger.error("Sync error:", err);
            });
        } else {
            return Q.reject(new Error("Can't synchronize when offline"));
        }
    });

    /*
     *  Auto sync allow to resync the localfs every interval
     */
    var autoSync = null;
    var updateAutoSync = function() {
        syncDuration = _.max([syncDuration, 5*60*1000]);
        logger.log("sync took ", syncDuration/1000,"seconds");
        autoSync =  _.throttle(function() {
            sync();
        }, 2*syncDuration);
    };
    updateAutoSync();

    return {
        'changes': changes,
        'urlToPath': urlToPath,
        'init': initFs,
        'ls': listDir,
        'create': createFile,
        'mkdir': createDirectory,
        'write': writeFile,
        'read': readFile,
        'mv': move,
        'rm': remove,
        'reset': syncFileBoxToLocal,
        'sync': sync,
        'autoSync': function() {
            return autoSync();
        },
        'enableSync': enableSync,
        'filer': filer,
        'syncDuration': syncDuration
    };
});