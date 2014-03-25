define([
    'hr/utils',
    'hr/hr',
    'utils/url',
    'vendors/filer',
    'core/operations',
    'utils/alerts',
    'collections/changes'
], function(_, hr, Url, Filer, operations, alerts, Changes) {
    var logger = hr.Logger.addNamespace("localfs");

    // Base folder for localfs
    var base = "/";
    var _isInit = false;
    var _syncIsEnable = false;
    var _ignoredFiles = [];
    var changes = new Changes();

    // Constant mime type for a directory
    var MIME_DIRECTORY = "inode/directory";

    // Duration for sync (ms)
    syncDuration = 1*60*1000;


    // Create fs interface
    var filer = new Filer();

    var fsCall = function(method, args, context) {
        if (!_syncIsEnable) return Q.reject(new Error("Offline synchronization is disabled"));
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
        logger.log("base is", base);
        return Q();
    };

    /*
     *  Enable/Disable sync
     */
    var enableSync = function(state) {
        _syncIsEnable = state != undefined? state : true;
    };

    /*
     *  Set ignored files list
     */
    var setIgnoredFiles = function(files) {
        _ignoredFiles = files || [];
        _ignoredFiles.push("/.git")
        _ignoredFiles = _.compact(_ignoredFiles);
        _ignoredFiles = _.uniq(_ignoredFiles);
        _ignoredFiles = _.map(_ignoredFiles, function(p) {
            if (p[0] != "/") p = "/"+p;
            return p;
        });
    };

    var prepareFs = function() {
        if (_isInit) return Q();
        return fsCall(filer.init, {
            persistent: true,
            size: 10 * 1024 * 1024
        }, filer)
        .then(function() {
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
        var basePath = window.location.pathname;
        basePath = basePath.substring(0, basePath.lastIndexOf("/")+1) + "vfs/";
        var path = url.substr(basePath.length-1);
        if (path.length == 0) path = '/';
        if (path[0] != '/') path = "/" + path;
        return path;
    };

    /*
     *  Test if path is ignored files
     */
    var isIgnoredFile = function(path) {
        return _.reduce(_ignoredFiles, function(state, ignoredPath) {
            if (state) return state;
            if (path.indexOf(ignoredPath) == 0) return true;
        }, false);
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
    var listDir = needFsReady(function(path, adapt) {
        path = (adapt == false) ? path : adaptPath(path);

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
                d.resolve(reader.result);
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
     *  Copy a file
     */
    var copy = needFsReady(function(from, to) {
        from = adaptPath(from);
        to = adaptPath(to);

        logger.log("copy:", from, "to", to);
        return fsCall(filer.cp, [from, '.', to], filer);
    });

    /*
     *  Remove a file or directory
     */
    var remove = needFsReady(function(path, adapt) {
        path = (adapt == false) ? path : adaptPath(path);

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
            if (isIgnoredFile(path)) {
                return;
            }
            logger.log("change:",type,path);
            changes.add(_.extend(args || {}, {
                'path': path,
                'time': Date.now(),
                'type': type || "M"
            }));
        }

        var getDirChanges = function(path) {
            var localEntries, boxEntries, currentEntryInfos, fp;
            if (isIgnoredFile(path)) {
                return Q();
            }

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
                    if (isIgnoredFile(boxFile.path())) return Q();

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
            title: "Calculating Offline Changes"
        });
    });

    /*
     *  Sync a file in the box fs with the local fs
     *
     *  this will download the files and saved them in the localfs
     */
    var syncFileBoxToLocal = needFsReady(function() {
        var box = require("core/box");

        var doSync = function(fp) {
            var path = fp.path();
            if (isIgnoredFile(path)) return Q();

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

            return listDir("/", false).then(function(rootFiles) {
                return Q.all(_.map(rootFiles, function(fp) {
                    return remove("/"+fp.name, false);
                }));
            }).then(function() {
                return doSync(box.root);
            }, function() {
                return doSync(box.root)
            }).then(function() {
                changes.reset([]);
                logger.warn("Finished sync: box->local");
            });
        }, {
            title: "Updating Offline Cache"
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
                    alerts.show(changes.size()+" changes made offline need to be synced manually", 5000);
                    return Q.reject(new Error("Offline changes not synced"));
                }
                return syncFileBoxToLocal();
            }).then(function() {
                //Calcul duration
                endT = Date.now();
                syncDuration = _.max([endT - startT, 5000]);
                updateAutoSync();
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
        'cp': copy,
        'rm': remove,
        'reset': syncFileBoxToLocal,
        'sync': sync,
        'autoSync': function() {
            return autoSync();
        },
        'enableSync': enableSync,
        'isSyncEnabled': function() { return _syncIsEnable; },
        'filer': filer,
        'syncDuration': syncDuration,
        'setIgnoredFiles': setIgnoredFiles
    };
});