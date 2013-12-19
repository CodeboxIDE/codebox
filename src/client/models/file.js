define([
    "q",
    "underscore",
    "hr/hr",
    "core/backends/vfs",
    "utils/url",
    "utils/languages",
    "utils/filesync",
    "utils/dialogs",
    "utils/uploader",
    "utils/localfs",
    "core/operations"
], function(Q, _, hr, vfs, Url, Languages, FileSync, Dialogs, Uploader, localfs, operations) {
    var logging = hr.Logger.addNamespace("files");

    if (typeof String.prototype.endsWith !== 'function') {
        String.prototype.endsWith = function(suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    }

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

        /*
         *  Initialize
         */
        initialize: function() {
            File.__super__.initialize.apply(this, arguments);
            this.codebox = this.options.codebox;
            this.content = null;
            this.read = this.download;

            // Change in codebox : file deleted
            this.on("file:change:delete", function() {
                logging.log("file "+this.path()+" is deleted");
                this.destroy();
            }, this);

            // Change in subfiles
            this.on("files:change:create files:change:delete", function() {
                logging.log("file updated in "+this.path());
                this.refresh();
            }, this);

            // Listen to codebox event
            this.codebox.on("box:watch:change", function(e) {
                // Event on this file itself
                if (e.data.path == this.path()) {
                    this.trigger("file:change:"+e.data.change, e.data);
                }

                // Event in subfile
                if (_.contains(["create", "delete"], e.data.change) && this.isChild(e.data.path)) {
                    this.trigger("files:change:"+e.data.change, e.data);
                }
            }, this);
            this.codebox.on("box:files:write", function(e) {
                if (e.data.path == this.path()) {
                    this.trigger("file:write", e.data);
                }
            }, this);
            return this;
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
            var url = "/vfs"+path;
            if (force_directory == null) force_directory = this.isDirectory();
            if (force_directory && !url.endsWith("/")) {
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
                path = Url.parse(this.get("href")).path.replace("/vfs", "");
            }
            
            if (path.endsWith("/")) {
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
            return this.get("mime") == "inode/directory";
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
         *  Return file sync environment id
         */
        syncEnvId: function() {
            if (this.isNewfile()) {
                return "temporary://"+Date.now()+_.uniqueId("file");
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
                return "folder-o";
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
                    "name": "/",
                    "size": 0,
                    "mtime": 0,
                    "mime": "inode/directory",
                    "href": "/vfs/",
                    "exists": true
                };
                this.set(fileData);
                return Q(fileData);
            }

            var parentPath = this.parentPath(path);
            var filename = this.filename(path);
            return this.vfsRequest("listdir", this.vfsUrl(parentPath, true)).then(function(filesData) {
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
            });
        },

        /*
         *  Refresh infos
         */
        refresh: function() {
            return this.getByPath(this.path());
        },

        /*
         *  Download
         */
        download: function(options) {
            var url, d, that = this;
            options = _.defaults(options || {}, {
                redirect: false
            });
            if (options.redirect) {
                window.open(this.exportUrl(),'_blank');
            } else {
                return this.vfsRequest("read", this.vfsUrl()).then(function(content) {
                    that.setCache(content);
                    return content;
                });
            }
        },

        /*
         *  Write file ocntent
         */
        write: function(content, filename) {
            var that = this;
            return this.vfsRequest("write", this.vfsUrl(filename), content).then(function() {
                return that.path(filename);
            });
        },

        /*
         *  Return content
         */
        getCache: function(callback) {
            if (this.content != null) {
                return Q(this.content);
            } else {
                //Download can't work for newfiles
                if (this.isNewfile()) {
                    return Q("");
                }

                return this.download();
            }
        },

        /*
         *  Define cache content content
         */
        setCache: function(content) {
            this.content = content;
            this.trigger("cache", this.content);
            return this;
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

            return this.vfsRequest("listdir", this.vfsUrl(null, true)).then(function(filesData) {
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
            });
        },

        /*
         *  Create a new file
         *  
         *  @name : name of the file to create
         */
        createFile: function(name) {
            return this.vfsRequest("create", this.vfsUrl(null, true)+"/"+name);
        },

        /*
         *  Create a new directory
         *  
         *  @name : name of the directory to create
         */
        mkdir: function(name) {
            return this.vfsRequest("mkdir", this.vfsUrl(null, true)+"/"+name+"/");
        },

        /*
         *  Remove the file or directory
         */
        remove: function() {
            return this.vfsRequest("remove", this.vfsUrl(null));
        },

        /*
         *  Rename the file
         *
         *  @name : new name for the file
         */
        rename: function(name) {
            var parentPath = this.parentPath();
            var newPath = parentPath+"/"+name;
            return this.vfsRequest("rename", this.vfsUrl(newPath), {
                "renameFrom": this.path()
            });
        },

        // (action) Refresh files list
        actionRefresh: function(e) {
            if (e) e.preventDefault();
            return this.getByPath(this.path());  
        },

        // (action) Create a new file
        actionCreate: function(e) {
            var that = this;
            if (e) e.preventDefault();
            return Dialogs.prompt("Create a new file", "", "newfile.txt").then(function(name) {
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
            Dialogs.prompt("Create a new directory", "", "newdirectory").then(function(name) {
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

            return Dialogs.prompt("Rename", "", this.get("name")).then(function(name) {
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

            return Dialogs.confirm("Do your really want to remove '"+_.escape(this.get("name"))+"'?").then(function(st) {
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
                        op.progress(p);
                    }).fin(function() {
                        $f.remove();
                    });
                }, {
                    title: "Uploading"
                });
            });
            $f.trigger('click');
        },

        // (action) Sync offline
        actionSyncOffline: function() {
            var that = this;
            return localfs.syncTo(that);
        },

        // Return context menu
        contextMenu: function() {
            var that = this;
            return function() {
                var menu = [];

                // Open with
                if (!that.isDirectory()) {
                    menu.push({
                        'id': "file.open.select",
                        'type': "action",
                        'title': "Open with...",
                        'action': function() {
                            that.open({
                                'userChoice': true
                            });
                        }
                    });
                    menu.push({ 'type': "divider" });
                }

                // File or directory
                if (!that.isRoot()) {
                    menu.push({
                        'id': "file.rename",
                        'type': "action",
                        'title': "Rename...",
                        'action': function() {
                            that.actionRename();
                        }
                    });
                    menu.push({
                        'id': "file.remove",
                        'type': "action",
                        'title': "Remove",
                        'action': function() {
                            that.actionRemove();
                        }
                    });
                    menu.push({ 'type': "divider" });
                }

                if (that.isDirectory()) {
                    // Directory
                    menu.push({
                        'id': "file.create",
                        'type': "action",
                        'title': "New file",
                        'action': function() {
                            that.actionCreate();
                        }
                    });
                    menu.push({
                        'id': "file.mkdir",
                        'type': "action",
                        'title': "New folder",
                        'action': function() {
                            that.actionMkdir();
                        }
                    });
                    menu.push({
                        'id': "file.refresh",
                        'type': "action",
                        'title': "Refresh",
                        'action': function() {
                            that.actionRefresh();
                        }
                    });
                    menu.push({
                        'id': "file.upload",
                        'type': "menu",
                        'title': "Upload",
                        'offline': false,
                        'menu': [
                            {
                                'id': "file.upload.files",
                                'type': "action",
                                'title': "Files",
                                'offline': false,
                                'action': function() {
                                    that.actionUpload();
                                }
                            },
                            {
                                'id': "file.upload.directory",
                                'type': "action",
                                'title': "Directory",
                                'offline': false,
                                'action': function() {
                                    that.actionUpload({
                                        'directory': true
                                    });
                                }
                            }
                        ]
                    });
                } else {
                    menu.push({
                        'id': "file.download",
                        'type': "action",
                        'title': "Download",
                        'action': function() {
                            that.actionDownload();
                        }
                    });
                }

                if (!that.isOffline()) {
                    menu.push({ 'type': "divider" });
                    menu.push({
                        'id': "file.sync.offline",
                        'type': "action",
                        'title': "Sync fo Offline uses",
                        'offline': false,
                        'action': function() {
                            that.actionSyncOffline();
                        }
                    });
                }

                return menu;
            };
        }
    });

    return File;
});