define([
    "q",
    "hr/hr",
    "vendors/diff_match_patch",
    "vendors/crypto",
    "core/user",
    "core/collaborators",
    "utils/dialogs"
], function(Q, hr, diff_match_patch, CryptoJS, user, collaborators, dialogs) {

    /*
    FileSync let you easily sync text content in files and access 
    collaborative data (participants, cursors, selections).

    var sync = new FileSync({
        'file': myfile
    });

    // Content is updated
    sync.on("content", function(newcontent) {
        // display the content to the user
    });

    // Update content
    sync.updateContent(mycontent);
    sync.updateUserCursor(x, y);
    sync.updateUserSelection(x, y);
    */

    var logging = hr.Logger.addNamespace("filesync");

    var FileSync = hr.Class.extend({
        defaults: {
            'file': null,
            'colors': [
                "#1abc9c",
                "#9b59b6",
                "#e67e22",
                "#16a085",
                "#c0392b",
                "#2980b9",
                "#f39c12",
                "#8e44ad"
            ]
        },
        modes: {
            ASYNC: "async",
            SYNC: "sync",
            READONLY: "readonly"
        },

        // Constructor
        initialize: function() {
            FileSync.__super__.initialize.apply(this, arguments);

            this.diff = new diff_match_patch();
            this.selections = {};
            this.cursors = {};
            this.synced = false;
            this.file = null;
            this.envId = null;
            this.envOptions = null;
            this.mode = this.modes.SYNC;
            this.ping = false;  // ping
            this.participants = []; // participants list
            this.syncState = false; // sync connexion state
            this.modified = false;

            // Add timer for ping
            this.timer = setInterval(_.bind(this._intervalPing, this), 15*1000);

            // Init file
            if (this.options.file) {
                this.setFile(this.options.file);
            }

            // Offline sync
            hr.Offline.on("state", function(state) {
                if (hr.Offline.isConnected()) return;
                if (this.envId) this.updateEnv(this.envId, this.envOptions);
            }, this);
        },

        // Change mode
        setMode: function(mode) {
            this.mode = mode;
            this.trigger("mode", mode);
        },

        /*
         *  Return current mode
         */
        getMode: function() {
            return this.mode;
        },

        // Update current user cursor
        updateUserCursor: function(x, y) {
            if (!this.isSync()) return this;
            return this.sendCursor(x, y);
        },

        // Update current user selection
        updateUserSelection: function(sx, sy, ex, ey) {
            if (!this.isSync()) return this;
            return this.sendSelection(sx, sy, ex, ey);
        },

        // Update content
        updateContent: function(value) {
            if (this.isReadonly()) return this;

            if (!value) return;

            // old content
            this.hash_value_t0 = this.hash_value_t1;

            // new content
            this.content_value_t1 = value;
            this.hash_value_t1 = String(CryptoJS.MD5(this.content_value_t1));

            // create patch
            var diff_data = this.diff.diff_main(this.content_value_t0, this.content_value_t1, true);
            var patch_list = this.diff.patch_make(this.content_value_t0, this.content_value_t1, diff_data);
            var patch_text = this.diff.patch_toText(patch_list);
             
            // update value
            this.content_value_t0 = this.content_value_t1;

            // send patch
            this.sendPatch(patch_text, this.hash_value_t0, this.hash_value_t1);
            if (this.file) this.file.setCache(this.content_value_t1);
        },


        // Maintain connexion with ping
        _intervalPing: function(){
            if (!this.isSync()) return;
            if (this.synced == false) {
                this.sendSync();
            } else {
                this.sendPing();
                this.setSyncState(this.ping == true);
                this.ping = false;
            }
        },

        /*
         *  Return true if syncronization is on
         */
        isSync: function() {
            return (this.envId != null && this.getMode() == this.modes.SYNC);
        },

        /*
         *  Return true if readonly
         */
        isReadonly: function() {
            return this.getMode() == this.modes.READONLY;
        },

        /*
         *  Return true if syncronization is established
         */
        isSyncStable: function() {
            return (this.isSync() && this.syncState);
        },

        /*
         *  Define file content
         */
        setContent: function(content, patch) {
            var oldcontent, oldmode_sync = this.sync;

            // Stop sync and update content
            this.sync = false;
            this.hash_value_t1 = String(CryptoJS.MD5(content));
            oldcontent = this.content_value_t0;
            this.content_value_t0 = content;
            this.content_value_t1 = content;
            this.trigger("content", content, oldcontent, patch);
            if (this.file != null) {
                this.file.setCache(content);
            }
            this.sync = oldmode_sync;
            return this;
        },

        /*
         *  Apply patch to content
         */
        patchContent: function(patch_data) {
            // Check old hash
            if (this.hash_value_t1 == patch_data.hashs.after)
            {
                // Same content
                return false;
            }

            // Apply on text
            var patches = this.diff.patch_fromText(patch_data['patch']);
            var results = this.diff.patch_apply(patches, this.content_value_t0);

            if (results.length < 2 || results[1][0] == false) {
                this.sendSync();
                return false;
            }

            var newtext = results[0];
            var newtext_hash = String(CryptoJS.MD5(newtext));

            // Check new hash
            if (newtext_hash != patch_data.hashs.after)
            {
                this.sendSync();
                return false;
            }

            // Set editor content
            this.setContent(newtext, patches);
            return true;
        },

        /*
         *  Update current file
         */
        updateEnv: function(envId, options) {
            var self = this;

            if (_.isObject(envId)) {
                options = envId;
                envId = this.envId;
            }

            options = _.defaults({}, options || {}, {
                sync: false
            });

            if (!envId) return this;

            this.envOptions = options
            this.envId = envId;

            this.hash_value_t0 = null;
            this.hash_value_t1 = null;
            this.content_value_t0 = null;
            this.content_value_t1 = null;

            logging.log("update env with", this.envId, options, hr.Offline.isConnected());

            if (!hr.Offline.isConnected() || !options.sync) {
                /// Offline sync
                self.setMode(self.modes.READONLY);

                this.file.getCache().then(function(content) {
                    // Update content
                    self.setContent(content);

                    // Enable sync
                    self.setMode(self.modes.ASYNC);
                }, function(err) {
                    logging.error("Error for offline sync: ", err);
                });
            } else {
                /// Online sync
                self.setMode(self.modes.SYNC);

                this.socket().then(function(socket) {
                    logging.log("creating socket");
                    socket.on('connect', function() {
                        logging.log("socket connect");
                    });
                    socket.on('connect_failed', function() {
                        logging.warn("socket connect failed");
                    });
                    socket.on('disconnect', function() {
                        logging.log("socket disconnect");
                        self.setSyncState(false);
                    });
                    socket.on('connecting', function() {
                        logging.log("socket connecting ...");
                    });
                    socket.on('message', function(data) {
                        logging.log("socket receive packet ", data);
                        self.ping = true;

                        // Calid data
                        if (data.action == null || data.environment == null || self.envId != data.environment) {
                            return;
                        }

                        // Changement file
                        if (data.path && (!self.file || data.path != self.file.path())) {
                            self.trigger("file:path", data.path);
                        }

                        switch (data.action) {
                            case "cursor":
                                if (data.from != user.get("userId")) {
                                    self.cursorMove(data.from, data.cursor.x, data.cursor.y);
                                }
                                break;
                            case "select":
                                if (data.from != user.get("userId")) {
                                    self.selectionMove(data.from, data.start.x, data.start.y, data.end.x, data.end.y);
                                }
                                break;
                            case "participants":
                                if (data.participants != null) {
                                    self.setParticipants(data.participants)
                                }
                                break;
                            case "sync":
                                if (data.content != null) {
                                    self.setContent(data.content);
                                    self.synced = true;
                                }
                                if (data.participants != null) {
                                    self.setParticipants(data.participants)
                                }
                                if (data.state != null) {
                                    self.file.modifiedState(data.state);
                                }
                                break;
                            case "patch":
                                if (data.patch != null) {
                                    self.patchContent(data);
                                }
                                break;
                            case "modified":
                                if (data.state != null) {
                                    self.file.modifiedState(data.state);
                                }
                                break;
                        }
                        self.setSyncState(true);
                    });

                    if (self.file != null && !self.file.isNewfile()) {
                        self.sendLoad(self.file.path());
                    } else {
                        self.sendSync();
                    }
                });
            }
        },

        /*
         *  Set file to the editor
         */
        setFile: function(file, options) {
            options = _.defaults({}, options || {}, {
                sync: false,
                autoload: true
            });

            if (!file.isValid()) {
                logging.error("invalid file for sync ", file);
                return;
            }

            logging.log("init file with options ", options);
            
            this.file = file;

            if (this.file != null) {
                
                this.file.on("set", _.partial(this.setFile, this.file, options), this);
                this.file.on("modified", this.trigger.bind(this, "sync:modified"));
                this.file.on("loading", this.trigger.bind(this, "sync:loading"));

                this.trigger("file:mode", this.file.mode());
                if (options.autoload) {
                    this.on("file:path", function(path) {
                        this.file.getByPath(path);
                    }, this);
                }

                this.updateEnv(this.file.syncEnvId(), options);
            }
        },

        /* Socket for the connexion */
        socket: function() {
            var that = this;

            var box = require("core/box");

            if (this._socket) return Q(this._socket);
            if (this.envId != null) {
                return box.socket("filesync", true).then(function(s) {
                    that._socket = s;
                    return that._socket;
                })
            } else {
                throw new Error("need 'envId' to create sync socket");
            }
        },

        /* Close sync socket */
        closeSocket: function() {
            var that = this;
            if (!this._socket) return;
            this._socket.disconnect();
            this_socket = null;
        },

        /*
         *  Enable realtime syncronization
         */
        setSyncState: function(st) {
            this.syncState = st;
            this.trigger("sync:state", this.syncState);
            return this;
        },

        /*
         *  Move a cursor to a position by id
         *  @id : cursor id
         *  @x : position x of the cursor (column)
         *  @y : position y of the cursor (line)
         */
        cursorMove: function(id, x, y) {
            if (user.get("userId") == id) {
                return this;
            }

            this.cursors[id] = {
                'x': x,
                'y': y,
                'color': this.participantColor(id)
            };
            this.trigger("cursor:move", id, this.cursors[id]);
            return this;
        },

        /*
         *  Cursors clear
         */
        cursorsClear: function() {
            var that = this;
            _.each(this.cursors, function(cid, userId) {
                that.trigger("cursor:remove", cid, that.cursors[cid]);
            });
            _.each(this.selections, function(cid, userId) {
                that.trigger("selection:remove", cid, that.selections[cid]);
            });
            return this;
        },

        /*
         *  Move a selection to a range by id
         *  @id : cursor id
         *  @sx : position start x of the selection (column)
         *  @sy : position start y of the selection (line)
         *  @ex : position end x of the selection (column)
         *  @ey : position end y of the selection (line)
         */
        selectionMove: function(id, sx, sy, ex, ey) {
            if (user.get("userId") == id) {
                return this;
            }

            this.selections[id] = {
                'color': this.participantColor(id),
                'start': {
                    'x': sx,
                    'y': sy
                },
                'end': {
                    'x': ex,
                    'y': ey
                }
            };
            this.trigger("selection:move", id, this.selections[id]);
            return this;
        },

        /*
         *  Return a cursor position by text index
         *  @index : index of the cursor in the text
         */
        cursorPosByindex: function(index, content) {
            var x = 0;
            var y = 0;

            content = content || this.content_value_t0;

            if (index < 0)
            {
                return [x,y];
            }

            for (var i = 0; i< content.length; i++){
                var c = content[i];
                if (index == i){
                    break;
                }
                x = x +1;
                if (c == "\n"){
                    x = 0;
                    y = y +1;
                }
            }
            return {
                'x': x,
                'y': y
            };
        },

        /*
         *  Return index by cursor position
         *  @cx : cursor position x (column)
         *  @cy : cursor position y (line)
         */
        cursorIndexBypos: function(cx, cy, content){
            var x = 0;
            var y = 0;
            var index = 0;

            content = content || this.content_value_t0;

            for (var i = 0; i< content.length; i++){
                index = i;
                var c = content[i];
                if (cx == x && cy == y){
                    break;
                }
                x = x +1;
                if (c == "\n"){
                    x = 0;
                    y = y +1;
                }
            }
            return index;
        },

        /*
         *  Apply patches to a cursor
         *  @cursor : cursor object {x:, y:}
         *  @patches : diff patches to apply
         */
        cursorPatch: function(cursor, patches, content){
            var self = this;

            var cursor_x = cursor.x;
            var cursor_y = cursor.y;

            content = content || this.content_value_t0;
            patches = patches || [];

            var cursor_index = self.cursorIndexBypos(cursor_x, cursor_y, content);

            _.each(patches, function(change, i) {
                var plage_start = change.start1
                var plage_size = change.length2 - change.length1;
                var plage_end = plage_start + change.length1;

                if (cursor_index <= plage_start){
                    //do nothing :
                    //le curseur est avant la plage de modification
                }
                else if (cursor_index >= plage_end){
                    //deplace le curseur de plage_size car :
                    //le curseur est aprés la plage de modification
                    cursor_index = cursor_index + plage_size;
                }
                else{
                    //le curseur est dans la plage de modification du patch
                    //deplacement doit etre calculé selon les diffs
                    _.each(change.diffs, function(diff, a) {
                        // taille du diff
                        var len = diff[1].length;
                        //deplacement
                        var dep = diff[0];


                        var diff_pos = change.start1+len;

                        if (diff_pos <= cursor_index)
                        {
                            cursor_index = cursor_index + dep
                        }
                    });
                }
            });
            return cursor_index;
        },

        /*
         *  Set lists of participants
         */
        setParticipants: function(parts) {
            this.participants = _.compact(_.map(parts, function(participant, i) {
                participant.user = collaborators.getById(participant.userId);
                if (!participant.user) {
                    logging.error("participant non user:", participant.userId);
                    return null;
                }
                participant.color = this.options.colors[i % this.options.colors.length];
                return participant;
            }, this));
            this.trigger("participants:change");
            return this;
        },

        /*
         *  Get participant color
         */
        participantColor: function(pid) {
            return _.reduce(this.participants, function(color, participant) {
                if (participant.userId == pid) {
                    return participant.color;
                }
                return color;
            }, "#ff0000");
        },

        /*
         *  Send to server
         *  @action : action to send
         *  @data : data for this action
         */
        send: function(action, data) {
            if (!this.isSync()) return this;

            if (this.envId != null && action != null) {
                data = _.extend({}, data || {}, {
                    'action': action,
                    'from': user.get("userId"),
                    'token': user.get("token"),
                    'environment': this.envId
                });

                logging.log("send packet", data);
                this.socket().then(function(socket) {
                    socket.json.send(data);
                })
            } else {
                this.setSyncState(false);
            }
            return this;
        },

        /*
         *  Send patch to the server
         *  @patch : patch to send
         *  @hash0 : hash before patch
         *  @hash1 : hash after patch
         */
        sendPatch: function(patch, hash0, hash1) {
            return this.send("patch", {
                "patch": patch,
                "hashs": {
                    "before": hash0,
                    "after": hash1
                }
            });
        },

        /*
         *  Send cursor positions to the server
         *  @cx : position x of the cursor
         *  @cy : position y of the cursor
         */
        sendCursor: function(cx, cy) {
            if (cx == null || cy == null) {
                return;
            }
            return this.send("cursor", {
                "cursor": {
                    "x": cx,
                    "y": cy
                }
            });
        },

        /*
         *  Send selection to the server
         *  @sx : position start x of the selection (column)
         *  @sy : position start y of the selection (line)
         *  @ex : position end x of the selection (column)
         *  @ey : position end y of the selection (line)
         */
        sendSelection: function(sx, sy, ex, ey) {
            if (sx == null || sy == null || ex == null || ey == null) {
                return;
            }
            return this.send("select", {
                "start": {
                    "x": sx,
                    "y": sy
                },
                "end": {
                    "x": ex,
                    "y": ey
                }
            });
        },

        /*
         *  Send ping to the server
         */
        sendPing: function() {
            return this.send("ping");
        },

        /*
         *  Send laod to the server to laod a file
         */
        sendLoad: function(path) {
            return this.send("load", {
                'path': path
            });
        },

        /*
         *  Send request to absolute sync to the server
         */
        sendSync: function() {
            this.send("sync");
            return true;
        },

        /*
         *  Save the file
         */
        save: function() {
            var that = this;

            // If online use the socket event "save"
            var doSave = function(args) {
                that.send("save", args);
                return Q();
            };

            // If aync mode
            if (this.getMode() == this.modes.ASYNC) {
                doSave = function(args) {
                    return that.file.write(that.content_value_t1, args.path).then(function(newPath) {
                        if (newPath != that.file.path()) {
                            that.trigger("file:path", newPath);
                        }
                    });
                };
            }

            if (this.file.isNewfile()) {
                return dialogs.prompt("Save as", "", this.file.filename()).then(function(name) {
                    return doSave({
                        'path': name
                    })
                });
            } else {
                return doSave({});
            }
        },

        /*
         *  Close the connexion
         */
        close: function() {
            this.send("close");
            this.off();
        },
    });

    return FileSync;
});