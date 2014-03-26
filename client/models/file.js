define([
    "hr/promise",
    "hr/utils",
    "hr/hr",
    'core/backends/rpc',
    "core/backends/vfs",
    "core/debug/manager",
    'models/command',
    "utils/string",
    "utils/url",
    "utils/languages",
    "utils/filesync",
    "utils/dialogs",
    "utils/uploader",
    "utils/clipboard",
    "core/operations"
], function(Q, _, hr, rpc, vfs, debugManager, Command, string, Url, Languages, FileSync, dialogs, Uploader, clipboard, operations) {
    var logging = hr.Logger.addNamespace("files");

    var File = hr.Model.extend({
        defaults: {
            "name": "",
            "size": 0,
            "mtime": 0,
            "mime": "",
            "href": "",
            "exists": true,
            "offline": false,
            "exportUrl": null
        },
        idAttribute: "href",

        /*
         *  Initialize
         */
        initialize: function() {
            File.__super__.initialize.apply(this, arguments);
            this.codebox = this.options.codebox || require("core/box");

            // Content for new file
            this.newFileContent = this.options.newFileContent || "";

            this.modified = false;
            this._loading = false;
            this._uniqueId = Date.now()+_.uniqueId("file");
            this.read = this.download;

            // Change in codebox : file deleted
            this.on("file:change:delete", function() {
                logging.log("file "+this.path()+" is deleted");
                this.destroy();
            }, this);

            // Change in subfiles
            this.on("files:change:create files:change:delete file:change:folder", function() {
                logging.log("file updated in "+this.path());
                this.refresh();
            }, this);

            // Listen to codebox event
            this.listenTo(this.codebox, "box:watch:change", function(e) {
                if (!this.isValid()) return;

                // Event on this file itself
                if (e.data.path == this.path()) {
                    this.trigger("file:change:"+e.data.change, e.data);
                }

                // Event in subfile
                if (_.contains(["create", "delete"], e.data.change) && this.isChild(e.data.path)) {
                    this.trigger("files:change:"+e.data.change, e.data);
                }
            });
            this.listenTo(this.codebox, "box:files:write", function(e) {
                if (e.data.path == this.path()) {
                    this.trigger("file:write", e.data);
                }
            });
            return this;
        },

        /*
         *  Set modified (and not saved) state
         */
        modifiedState: function(state) {
            if (this.modified == state) return;
            this.modified = state;
            this.trigger("modified", this.modified);
        },

        /*
         *  Set loading state
         */
        loading: function(state) {
            var that = this;

            if (Q.isPromise(state)) {
                that.loading(true);
                state.fin(function() {
                    that.loading(false);
                });
                return state;
            }

            // Boolean
            if (this._loading == state) return;
            this._loading = state;
            this.trigger("loading", this._loading);
        },

        /*
         *  VFS request
         */
        vfsRequest: function(method, url, args) {
            return vfs.execute(method, args, {
                'url': url
            });
        },

        /*
         *  Check if the file can be open
         */
        canOpen: function() {
            return this.get("offline") || hr.Offline.isConnected();
        },

        /*
         *  Open the tab for this file
         */
        open: function(path, options) {
            var files = require("core/files");
            if (_.isObject(path)) {
                options = path;
                path = this;
            }

            return files.open(path, options);
        },

        /*
         *  Return true if file is valid
         */
        isValid: function() {
            return this.get("href", "").length > 0;
        },

        /*
         *  Return the full url with the host
         */
        vfsFullUrl: function() {
            return this.codebox.baseUrl+this.vfsUrl.apply(this, arguments);
        },

        /*
         *  Return url to download the file
         */
        exportUrl: function() {
            if (this.get("exportUrl")) {
                return this.get("exportUrl");
            }
            return this.vfsFullUrl();
        },

        /*
         *  VFS url
         */
        vfsUrl: function(path, force_directory) {
            path = this.path(path);
            var basePath = window.location.pathname;
            basePath.substring(0, basePath.lastIndexOf('/')+1);
            var url = basePath+"vfs"+path;
            if (force_directory == null) force_directory = this.isDirectory();
            if (force_directory && !string.endsWith(url, "/")) {
                url = url+"/";
            }
            return url;
        },

        /*
         *  Return path to the file
         */
        path: function(path) {
            if (path == null) {
                if (this.get("href").length == 0) { return null; }
                path = Url.parse(this.get("href")).pathname.replace("/vfs", "");
            }

            if (string.endsWith(path, "/")) {
                path = path.slice(0, -1)
            }
            if (path.length == 0) {
                path = "/";
            }
            if (path[0] != '/') {
                path = '/'+path;
            }
            return path;
        },

        /*
         *  Return file mode (for ace editor)
         */
        mode: function(file) {
            return Languages.get_mode_byextension(this.extension());
        },

        /*
         *  Return color to represent the file
         */
        color: function(file, def) {
            if (this.isDirectory()) {
                return def;
            }
            return Languages.get_color_byext(this.extension(), def);
        },

        /*
         *  Return path to the parent
         */
        parentPath: function(path) {
            path = this.path(path);
            if (path == "/") { return "/"; }
            return path.split("/").slice(0, -1).join("/");
        },

        /*
         *  Return filename from the path
         */
        filename: function(path) {
            path = this.path(path);
            if (path == "/") { return "/"; }
            return path.split("/").slice(-1).join("/");
        },

        /*
         *  Return true if is a directory
         */
        isDirectory: function() {
            return (this.get("mime") == "inode/directory"
                || (this.get("mime") == "inode/symlink" && this.get("linkStat.mime") == "inode/directory"));
        },

        /*
         *  Return true if it is a new fiel (not yet on disk)
         */
        isNewfile: function() {
            return !this.get("exists");
        },

        /*
         *  Return true if the file is sync offline
         */
        isOffline: function() {
            return this.get("offline");
        },

        /*
         *  Return true if it's root directory
         */
        isRoot: function() {
            return this.path() == "/";
        },

        /*
         *  Return true if it's git root
         */
        isGit: function() {
            return this.path() == "/.git";
        },

        /* 
         *  Test if a path is a direct child
         *
         *  @path : path to test
         */
        isChild: function(path) {
            var parts1 = _.filter(path.split("/"), function(p) { return p.length > 0; });
            var parts2 = _.filter(this.path().split("/"), function(p) { return p.length > 0; });
            return (parts1.length == (parts2.length+1));
        },

        /*
         *  Test if a path is child
         *
         *  @path : path to test
         */
        isSublevel: function(path) {
            var parts1 = _.filter(path.split("/"), function(p) { return p.length > 0; });
            var parts2 = _.filter(this.path().split("/"), function(p) { return p.length > 0; });
            return (parts1.length > parts2.length);
        },

        /*
         *  Return true if this file should be hidden
         */
        isHidden: function() {
            return this.get("name", "").indexOf(".") == 0;;
        },

        /*
         *  Return file extension
         */
        extension: function() {
            return "."+this.get("name").split('.').pop();
        },

        /*
         *  Return current breakpoints for this file
         */
        getBreakpoints: function() {
            return debugManager.breakpoints.getFileBreakpoints(this.path());
        },

        /*
         *  Set breakpoints for this file
         */
        setBreakpoints: function(points) {
            return debugManager.breakpoints.setFileBreakpoints(this.path(), points);
        },

        /*
         *  Clear breakpoints for this file
         */
        clearBreakpoints: function() {
            return this.setBreakpoints([]);
        },

        /*
         *  Return file sync environment id
         */
        syncEnvId: function() {
            if (this.isNewfile()) {
                return "temporary://"+this._uniqueId;
            }
            return "file://"+this.path();
        },

        /*
         *  Return icon to represent the file
         */
        icon: function() {
            var extsIcon = {
                "picture-o": [".png", ".jpg", ".gif", ".tiff", ".jpeg", ".bmp", ".webp", ".svg"],
                "music": [".mp3", ".wav"],
                "film": [".avi", ".mp4"]
            }
            if (!this.isDirectory()) {
                var ext = this.extension().toLowerCase();
                return _.reduce(extsIcon, function(memo, exts, icon) {
                    if (_.contains(exts, ext)) return icon; 
                    return memo;
                }, "file-text-o");
            } else {
                return "folder";
            }
        },

        /*
         *  Return paths decompositions
         */
        paths: function() {
            return _.map(this.path().split("/"), function(name, i, parts) {
                var partialpath = parts.slice(0, i).join("/")+"/"+name
                return {
                    "path": partialpath,
                    "url": this.codebox.vBaseUrl+partialpath,
                    "name": name
                }
            }, this);
        },

        /*
         *  Load file by its path
         *
         *  @path : path to the file
         */
        getByPath: function(path) {
            var that = this;

            path = this.path(path);
            if (path == "/") {
                var fileData = {
                    "name": this.codebox.get("name"),
                    "size": 0,
                    "mtime": 0,
                    "mime": "inode/directory",
                    "href": location.protocol+"//"+location.host+"/vfs/",
                    "exists": true
                };
                this.set(fileData);
                return Q(fileData);
            }

            var parentPath = this.parentPath(path);
            var filename = this.filename(path);
            return this.loading(this.vfsRequest("listdir", this.vfsUrl(parentPath, true)).then(function(filesData) {
                var fileData = _.find(filesData, function(file) {
                    return file.name == filename;
                });
                if (fileData != null) {
                    fileData.exists = true;
                    that.set(fileData);
                    return Q(fileData);
                } else {
                    return Q.reject(new Error("Can't find file"));
                }
            }));
        },

        /*
         *  Return a child object
         */
        getChild: function(name) {
            var nPath = this.path()+"/"+name;
            var f = new File({
                'box': this.box
            });
            return f.getByPath(nPath).then(function() {
                return f;
            });
        },

        /*
         *  Refresh infos
         */
        refresh: function() {
            var that = this;
            return this.getByPath(this.path()).then(function() {
                that.trigger("refresh");
            });
        },

        /*
         *  Download
         */
        download: function(filename, options) {
            var url, d, that = this;

            if (_.isObject(filename)) {
                options = filename;
                filename = null;
            }

            if (this.isNewfile() && !filename) return Q(this.newFileContent);

            options = _.defaults(options || {}, {
                redirect: false
            });
            if (options.redirect) {
                window.open(this.exportUrl(),'_blank');
            } else {
                return this.loading(this.vfsRequest("read", this.vfsUrl(filename, false)).then(function(content) {
                    return content;
                }));
            }
        },

        /*
         *  Write file ocntent
         */
        write: function(content, filename) {
            var that = this;
            return this.loading(this.vfsRequest("write", this.vfsUrl(filename, false), content).then(function() {
                return that.path(filename);
            }));
        },

        /*
         *  List directory
         */
        listdir: function(options) {
            var that = this;

            if (!this.isDirectory()) {
                throw "Try getting files in a non directory"
            }

            options = _.defaults(options || {}, {
                order: "name",
                group: true
            });

            return this.loading(this.vfsRequest("listdir", this.vfsUrl(null, true)).then(function(filesData) {
                var files = _.map(filesData, function(file) {
                    return new File({
                        "codebox": that.codebox
                    }, file)
                });

                files = _.sortBy(files, function(file) {
                    return file.get(options.order).toLowerCase();
                });
                if (options.group) {
                    groups = _.groupBy(files, function(file){
                        return file.isDirectory() ? "directory" : "file";
                    });
                    files = [].concat(groups["directory"] || []).concat(groups["file"] || []);
                }
                return Q(files);
            }));
        },

        /*
         *  Create a new file
         *  
         *  @name : name of the file to create
         */
        createFile: function(name) {
            return this.loading(this.vfsRequest("create", this.vfsUrl(null, true)+"/"+name));
        },

        /*
         *  Create a new directory
         *  
         *  @name : name of the directory to create
         */
        mkdir: function(name) {
            return this.loading(this.vfsRequest("mkdir", this.vfsUrl(null, true)+"/"+name+"/"));
        },

        /*
         *  Remove the file or directory
         */
        remove: function() {
            var that = this;
            return this.loading(this.vfsRequest("remove", this.vfsUrl(null)));
        },

        /*
         *  Rename the file
         *
         *  @name : new name for the file
         */
        rename: function(name) {
            var parentPath = this.parentPath();
            var newPath = parentPath+"/"+name;
            return this.loading(this.vfsRequest("special", this.vfsUrl(newPath), {
                "renameFrom": this.path()
            }));
        },

        /*
         *  Copy this file
         *
         *  @to: folder to copy to
         *  @newName: (optional) new name in the to folder
         */
        copyTo: function(to, newName) {
            newName = newName || this.get("name");
            var toPath = to+"/"+newName;

            return this.loading(this.vfsRequest("special", this.vfsUrl(toPath), {
                "copyFrom": this.path()
            }));
        },

        /*
         *  Copy a file in this folder
         *
         *  @from: file to copy
         */
        copyFile: function(from, newName) {
            newName = newName || from.split("/").pop();
            var toPath = this.path()+"/"+newName;

            return this.loading(this.vfsRequest("special", this.vfsUrl(toPath, false), {
                "copyFrom": from
            }));
        },

        /*
         * Run the file
         */
        run: function() {
            var path = this.path();
            return rpc.execute("run/file", {
                'file': path
            }).then(function(runInfos) {
                Command.run("terminal.open", runInfos.shellId);
                return Q(runInfos);
            }, function(err) {
                dialogs.alert("Error running this file", "An error occurred when trying to run this file ("+path+"): "+(err.message || err));
            });
        },

        // (action) Run the file
        actionRun: function(e) {
            if (e) e.preventDefault();
            return this.run();  
        },

        // (action) Refresh files list
        actionRefresh: function(e) {
            if (e) e.preventDefault();
            return this.refresh();  
        },

        // (action) Create a new file
        actionCreate: function(e) {
            var that = this;
            if (e) e.preventDefault();
            return dialogs.prompt("Create a new file", "", "newfile.txt").then(function(name) {
                if (name.length > 0) {
                    return that.createFile(name);
                }
                return Q.reject(new Error("Name is too short"));
            });
        },

        // (action) Create a new directory
        actionMkdir: function(e) {
            var that = this;
            if (e) e.preventDefault();
            dialogs.prompt("Create a new directory", "", "newdirectory").then(function(name) {
                if (name.length > 0) {
                    return that.mkdir(name);
                }
                return Q.reject(new Error("Name is too short"));
            });
        },

        // (action) Rename a file
        actionRename: function(e) {
            var that = this;
            if (e) e.preventDefault();

            return dialogs.prompt("Rename", "", this.get("name")).then(function(name) {
                if (name.length > 0) {
                    return that.rename(name);
                }
                return Q.reject(new Error("Name is too short"));
            });
        },

        // (action) Delete files
        actionRemove: function(e) {
            var that = this;
            if (e) e.preventDefault();

            return dialogs.confirm("Do your really want to remove '"+_.escape(this.get("name"))+"'?").then(function(st) {
                if (st != true) return Q.reject(new Error("No confirmation"));
                return that.remove();
            });
        },

        // (action) Download a file
        actionDownload: function(e) {
            var that = this;
            if (e) e.preventDefault();

            return that.download({
                redirect: true
            });
        },

        // (action) Upload file
        actionUpload: function(options) {
            var that = this;

            options = _.defaults({}, options || {}, {
                'directory': false,
                'multiple': true
            });

            // Uploader
            var uploader = new Uploader({
                "directory": this
            });

            var $f = $("input.cb-file-uploader");
            if ($f.length == 0) {
                var $f = $("<input>", {
                    "type": "file",
                    "class": "cb-file-uploader"
                });
                $f.appendTo($("body"));
            }

            $f.hide();

            $f.prop("webkitdirectory", options.directory);
            $f.prop("directory", options.directory);
            $f.prop("multiple", options.multiple);

            // Create file element for selection
            $f.change(function(e) {
                e.preventDefault();

                operations.start("files.upload", function(op) {
                    return uploader.upload(e.currentTarget.files).progress(function(p) {
                        that.trigger("uploadProgress", p);
                        op.progress(p.percent);
                    }).fin(function() {
                        $f.remove();
                    });
                }, {
                    title: "Uploading"
                });
            });
            $f.trigger('click');
        },

        // Return context menu
        contextMenu: function() {
            var that = this;
            var files = require("core/files");

            return function() {
                var menu = [];

                // Open with
                if (!that.isDirectory()) {
                    var handlers = files.getHandlers(that);
                    _.each(handlers, function(handler) {
                        menu.push({
                            'type': "action",
                            'title': handler.name,
                            'icons': {
                                'menu': handler.icon
                            },
                            'action': function() {
                                return handler.open(that);
                            }
                        });
                    });
                    menu.push({ 'type': "divider" });
                }

                // File or directory
                if (!that.isRoot()) {
                    menu.push({
                        'type': "action",
                        'title': "Rename...",
                        'action': function() {
                            return that.actionRename();
                        }
                    });
                    menu.push({
                        'type': "action",
                        'title': "Delete "+(that.isDirectory() ? "Folder" : "File"),
                        'action': function() {
                            return that.actionRemove();
                        }
                    });
                    menu.push({ 'type': "divider" });
                }

                if (!that.isDirectory()) {
                    menu.push({
                        'type': "action",
                        'title': "Copy",
                        'action': function() {
                            clipboard.setData("file", that.path());
                        }
                    });
                    menu.push({
                        'type': "action",
                        'title': "Cut",
                        'action': function() {
                            clipboard.setData("file", that.path(), {
                                cut: true
                            });
                        }
                    });
                } else {
                    menu.push({
                        'type': "action",
                        'title': "Paste",
                        'flags': (!clipboard.hasData("file") ? "disabled" : ""),
                        'action': function() {
                            if (clipboard.hasData("file")) {
                                var path = clipboard.getData("file");
                                var cut = clipboard.getRaw().options.cut == true;

                                // Load file we are copying
                                var toCopy = new File();
                                return toCopy.getByPath(path)
                                .then(function() {
                                    // Copy file
                                    return toCopy.copyTo(that.path());
                                })
                                .then(function() {
                                    // If cut then delete the previsous file and clear clipboard
                                    if (cut == false) return;

                                    // Clear clipboard
                                    clipboard.clear();

                                    // Remove file copied
                                    return toCopy.remove();
                                })
                                .fail(function(err) {
                                    logging.error("error copy", err.stack, err);
                                })
                                .done(function() {
                                    // Clear temporary model
                                    toCopy.destroy();
                                })
                            }
                        }
                    });
                }
                menu.push({ 'type': "divider" });

                if (that.isDirectory()) {
                    // Directory
                    menu.push({
                        'type': "action",
                        'title': "New file",
                        'action': function() {
                            return that.actionCreate();
                        }
                    });
                    menu.push({
                        'type': "action",
                        'title': "New folder",
                        'action': function() {
                            return that.actionMkdir();
                        }
                    });
                    menu.push({
                        'type': "menu",
                        'title': "Add",
                        'offline': false,
                        'menu': [
                            {
                                'type': "action",
                                'title': "Files",
                                'offline': false,
                                'action': function() {
                                    that.actionUpload();
                                }
                            },
                            {
                                'type': "action",
                                'title': "Directories",
                                'offline': false,
                                'action': function() {
                                    that.actionUpload({
                                        'directory': true
                                    });
                                }
                            }
                        ]
                    });
                    menu.push({ 'type': "divider" });
                    menu.push({
                        'type': "action",
                        'title': "Refresh",
                        'action': function() {
                            return that.actionRefresh();
                        }
                    });
                    menu.push({
                        'type': "action",
                        'title': "Find in Folder",
                        'action': function() {
                            return Command.run("code.search", {
                                'path': that.path()
                            });
                        }
                    });
                    menu.push({
                        'type': "action",
                        'title': "Open Terminal",
                        'action': function() {
                            return Command.run("terminal.open", null, {
                                'cwd': that.path()
                            });
                        }
                    });
                } else {
                    menu.push({
                        'type': "action",
                        'title': "Download",
                        'action': function() {
                            that.actionDownload();
                        }
                    });
                    menu.push({ 'type': "divider" });
                    menu.push({
                        'type': "action",
                        'title': "Run",
                        'offline': false,
                        'action': function() {
                            that.actionRun();
                        }
                    });
                }

                return menu;
            };
        }
    });

    return File;
});