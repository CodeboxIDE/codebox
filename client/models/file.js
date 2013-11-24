define([
    "q",
    "underscore",
    "hr/hr",
    "core/api",
    "utils/url",
    "utils/languages",
    "utils/filesync",
    "utils/dialogs",
    "utils/uploader"
], function(Q, _, hr, api, Url, Languages, FileSync, Dialogs, Uploader) {
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
            "collaborators": [],
            "exists": true
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
         *  Open the tab for this file
         */
        open: function(path) {
            var files = require("core/files");
            return files.open(path ? path : this);
        },

        /*
         *  Return true if file is valid
         */
        isValid: function() {
            return this.get("href", "").length > 0;
        },

        /*
         *  Return url to download the file
         */
        exportUrl: function() {
            return this.codebox.baseUrl+this.vfsUrl();
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
         *  Return true if it's root directory
         */
        isRoot: function() {
            return this.path() == "/";
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
            return api.request("getJSON", this.vfsUrl(parentPath, true)).then(function(filesData) {
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
            var url, d;
            options = _.defaults(options || {}, {
                redirect: false
            });
            url = this.exportUrl();
            if (options.redirect) {
                window.open(url,'_blank');
            } else {
                d = hr.Requests.get(url);
                d.done(_.bind(function(content) {
                    this.setCache(content);
                }, this));
                return d;
            }
        },

        /*
         *  Write file ocntent
         */
        write: function(content) {
            var uploadurl = this.codebox.baseUrl+this.vfsUrl(null);
            var d = Q.defer();
            var xhr = new XMLHttpRequest(),
                upload = xhr.upload,
                start_time = new Date().getTime(),
                total_size = content.length;

            upload.downloadStartTime = start_time;
            upload.currentStart = start_time;
            upload.currentProgress = 0;
            upload.startData = 0;
            upload.addEventListener("progress",function(e){
                if (e.lengthComputable) {
                    var percentage = Math.round((e.loaded * 100) / total_size);
                }
            }, false);
            
            xhr.open("PUT", uploadurl, true);
            xhr.onreadystatechange = function(e){
                if (xhr.status != 200)  {
                    d.reject();
                    e.preventDefault();
                    return;
               }
            };
            xhr.sendAsBinary(content);
            xhr.onload = function() {
                if (xhr.status == 200 && xhr.responseText) {
                    d.resolve();
                }
            }

            return d.promise;
        },

        /*
         *  Return content
         */
        getCache: function(callback) {
            if (this.content != null) {
                return Q(this.content);
            } else {
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

            return api.request("getJSON", this.vfsUrl(null, true)).then(function(filesData) {
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
            return api.request("put", this.vfsUrl(null, true)+"/"+name);
        },

        /*
         *  Create a new directory
         *  
         *  @name : name of the directory to create
         */
        mkdir: function(name) {
            return api.request("put", this.vfsUrl(null, true)+"/"+name+"/");
        },

        /*
         *  Remove the file or directory
         */
        remove: function() {
            return api.request("delete", this.vfsUrl(null));
        },

        /*
         *  Rename the file
         *
         *  @name : new name for the file
         */
        rename: function(name) {
            var parentPath = this.parentPath();
            var newPath = parentPath+"/"+name;
            return api.request("post", this.vfsUrl(newPath), JSON.stringify({
                "renameFrom": this.path()
            }));
        },

        // (action) Refresh files list
        actionRefresh: function(e) {
            e.preventDefault();
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

        // Return context menu
        contextMenu: function() {
            var that = this;
            return function() {
                var menu = [];

                // File or directory
                if (!that.isRoot()) {
                    menu.push({
                        'type': "action",
                        'text': "Rename...",
                        'action': function() {
                            that.actionRename();
                        }
                    });
                    menu.push({
                        'type': "action",
                        'text': "Remove",
                        'action': function() {
                            that.actionRemove();
                        }
                    });
                    menu.push({ 'type': "divider" });
                }

                if (that.isDirectory()) {
                    // Directory
                    menu.push({
                        'type': "action",
                        'text': "New file",
                        'action': function() {
                            that.actionCreate();
                        }
                    });
                    menu.push({
                        'type': "action",
                        'text': "New folder",
                        'action': function() {
                            that.actionMkdir();
                        }
                    });
                    menu.push({
                        'type': "action",
                        'text': "Refresh",
                        'action': function() {
                            that.actionRefresh();
                        }
                    });
                    menu.push({
                        'type': "menu",
                        'text': "Upload",
                        'items': [
                            {
                                'type': "action",
                                'text': "Files",
                                'action': function() {}
                            },
                            {
                                'type': "action",
                                'text': "Directory",
                                'action': function() {}
                            }
                        ]
                    });
                } else {
                    menu.push({
                        'type': "action",
                        'text': "Download",
                        'action': function() {
                            that.actionDownload();
                        }
                    });
                }

                return menu;
            };
        }
    });

    return File;
});