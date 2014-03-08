define([
    "hr/promise",
    "hr/hr",
    "vendors/diff_match_patch",
    "utils/hash",
    "core/user",
    "core/collaborators",
    "utils/dialogs"
], function(Q, hr, diff_match_patch, hash, user, collaborators, dialogs) {
    var logging = hr.Logger.addNamespace("filesync");

    // hash method for patch
    var _hash = function(s) {
        return hash.hex32(hash.crc32(s));
    };

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

            // Diff/Patch calculoator
            this.diff = new diff_match_patch();

            // Current selections
            this.selections = {};

            // Current cursors
            this.cursors = {};
            this.synced = false;

            // File model for this sync
            this.file = null;

            // Environment id used for sync
            this.envId = null;
            this.envOptions = null;

            // Mode for edition
            this.mode = this.modes.SYNC;

            // Ping has been received
            this.ping = false;

            // List of participants
            this.participants = [];

            // Synchronization state
            this.syncState = false;
            this.timeOfLastLocalChange = Date.now();

            // Modified state
            this.modified = false;

            // Add timer for ping
            this.timer = setInterval(_.bind(this._intervalPing, this), 15*1000);

            // Patch queue
            this.patchQueue = new hr.Queue({
                task: this.patchContent,
                context: this
            });

            // Init file
            if (this.options.file) {
                this.setFile(this.options.file);
            }

            // Offline sync
            hr.Offline.on("state", function(state) {
                if (hr.Offline.isConnected()) return;
                if (this.envId) this.updateEnv(this.envId, _.extend({}, this.envOptions, {
                    reset: false
                }));
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

        /*
         *  Update content of the document (for all collaborators)
         *  Call this method when you detec a change in the editor, ...
         */
        updateContent: function(value) {
            if (!value || this.isReadonly()) return;

            // Old content hash
            this.hash_value_t0 = this.hash_value_t1;

            // New content hash
            this.content_value_t1 = value;
            this.hash_value_t1 = _hash(this.content_value_t1);

            // Create patch
            var patch_list = this.diff.patch_make(this.content_value_t0, this.content_value_t1);
            var patch_text = this.diff.patch_toText(patch_list);
             
            // Update value
            this.content_value_t0 = this.content_value_t1;

            // Send patch
            this.timeOfLastLocalChange = Date.now();
            this.sendPatch(patch_text, this.hash_value_t0, this.hash_value_t1);

            this.file.modifiedState(true);
        },


        // Maintain connection with ping
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
        setContent: function(content) {
            var oldcontent, oldmode_sync = this.sync;

            // Stop sync and update content
            this.sync = false;

            // Calcul patches
            var patches = this.diff.patch_make(this.content_value_t0, content);

            // Calcul new hash
            this.hash_value_t1 = _hash(content);

            oldcontent = this.content_value_t0;
            this.content_value_t0 = content;
            this.content_value_t1 = content;

            // Trigger event to signal we have new content
            this.trigger("content", content, oldcontent, patches);

            // Return to previous sync mode
            this.sync = oldmode_sync;

            return this;
        },

        /*
         *  Apply patch to content
         */
        patchContent: function(patch_data) {
            logging.log("receive patch ", patch_data);

            // Check patch
            if (!patch_data
            || !patch_data.patch
            || !patch_data.hashs.before
            || !patch_data.hashs.after) {
                logging.error("Invalid patch data");
                return false;
            }

            // Check old hash
            if (this.hash_value_t1 == patch_data.hashs.after) {
                // Same content
                return false;
            }

            // Apply on text
            var patches = this.diff.patch_fromText(patch_data.patch);
            var results = this.diff.patch_apply(patches, this.content_value_t0);

            // Test patch application (results[1] contains a list of boolean for patch results)
            if (results.length < 2 
            || _.compact(results[1]).length != results[1].length) {
                logging.error("invalid application of ", patches, results);
                this.sendSync();
                return false;
            }            

            var newtext = results[0];
            var newtext_hash = _hash(newtext);

            // Check new hash if last changes from this user is older than 2sec
            if ((Date.now() - this.timeOfLastLocalChange) > 2000
            && newtext_hash != patch_data.hashs.after) {
                logging.warn("invalid version -> resync");
                this.sendSync();
                return false;
            }

            // Set editor content
            this.setContent(newtext);
            return true;
        },

        /*
         *  Convert patch to a list of operations
         *  Format for an operation:
         *  {
         *      type: "insert" or "remove",
         *      content: "operation content",
         *      index: (int) position for this operation in the file
         *  }
         */
        patchesToOps: function(patches) {
            return _.chain(patches)
                .map(function(change, i) {
                    var diffIndex = change.start1;

                    return _.map(change.diffs, function(diff, a) {
                        var content = diff[1];
                        var diffType = diff[0];

                        diffType = diffType > 0 ? "insert" : 
                            (diffType == 0 ? null : "remove");

                        var op = !diffType? null : {
                            'type': diffType,
                            'content': content,
                            'index': diffIndex
                        };

                        if (!diffType) {
                            diffIndex = diffIndex + content.length;
                        } else {
                            diffIndex = diffIndex + content.length;
                        }
                        return op;
                    });
                })
                .flatten()
                .compact()
                .value();
        },

        /*
         *  Update synchronization environement
         */
        updateEnv: function(envId, options) {
            var self = this;

            // Send close to previous session
            this.send("close");

            if (_.isObject(envId)) {
                options = envId;
                envId = this.envId;
            }

            options = _.defaults({}, options || {}, {
                sync: false,
                reset: false
            });

            if (!envId) return this;
            if (this.file.isNewfile() || !hr.Offline.isConnected()) options.sync = false;
            options.reset = options.sync? false : options.reset;

            this.envOptions = options
            this.envId = envId;

            logging.log("update env with", this.envId, options, hr.Offline.isConnected());

            this.content_value_t0 = this.content_value_t0 || "";
            this.content_value_t1 = this.content_value_t1 || "";

            if (options.reset) {
                this.hash_value_t0 = null;
                this.hash_value_t1 = null;
                this.content_value_t0 = "";
                this.content_value_t1 = "";
            }

            // Signal update
            this.trigger("update:env", options);

            // Reset participants
            this.setParticipants([]);

            // Start sync
            if (!options.sync) {
                if (options.reset) {
                    this.setMode(self.modes.READONLY);

                    this.file.download().then(function(content) {
                        self.file.modifiedState(false);

                        // Update content
                        self.setContent(content);

                        // Enable sync
                        self.setMode(self.modes.ASYNC);
                    }, function(err) {
                        logging.error("Error for offline sync: ", err);
                        self.trigger("close");
                    });
                } else {
                    this.setMode(self.modes.ASYNC);
                    this.setContent(this.content_value_t1 || "");
                }
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
                        if (!self.isSync()) return;

                        //logging.log("socket receive packet ", data);
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
                                self.patchQueue.defer(data);
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
         *  Set file for the synschronization
         */
        setFile: function(file, options) {
            options = _.defaults({}, options || {}, {
                sync: false,
                reset: true,
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

        /*
         *  Return a socket for this connexion
         */
        socket: function() {
            var that = this;

            var box = require("core/box");

            if (this._socket) return Q(this._socket);
            if (this.envId != null) {
                return box.socket("filesync").then(function(s) {
                    that._socket = s;
                    return that._socket;
                })
            } else {
                throw new Error("need 'envId' to create sync socket");
            }
        },

        /*
         *  Close connexion with the server
         */
        closeSocket: function() {
            var that = this;
            if (!this._socket) return;
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
         *  @operations: operations to paply
         */
        cursorApplyOps: function(cursor, operations, content){
            var cursorIndex, diff;

            content = content || this.content_value_t0;
            operations = operations || [];

            cursorIndex = this.cursorIndexBypos(cursor.x, cursor.y, content);

            for (var i in operations) {
                var op = operations[i];

                if (cursorIndex < op.index) {
                    // Before operations -> ignore
                } else {
                    diff = (op.type == "insert") ? 1 : -1;
                    cursorIndex = cursorIndex + diff * op.content.length;
                }
            }

            return cursorIndex;
        },

        /*
         *  Set lists of participants
         */
        setParticipants: function(participants) {
            // Update participants list
            this.participants = _.chain(participants)
            .map(function(participant, i) {
                participant.user = collaborators.getById(participant.userId);
                if (!participant.user) {
                    logging.error("participant non user:", participant.userId);
                    return null;
                }

                // Color for this participant
                participant.color = this.options.colors[i % this.options.colors.length];

                return participant;
            }, this)
            .compact()
            .value();

            this.participantIds = _.pluck(participants, "userId");
            logging.log("update participants", this.participantIds);

            // Signal participant update
            this.trigger("participants");

            // Clear old participants cursors
            _.each(this.cursors, function(cursor, cId) {
                if (_.contains(this.participantIds, cId)) return;

                this.trigger("cursor:remove", cId);
                delete this.cursors[cId];
            }, this);
            _.each(this.selections, function(cursor, cId) {
                if (_.contains(this.participantIds, cId)) return;

                this.trigger("selection:remove", cId);
                delete this.selections[cId];
            }, this);

            // Update all participants cursor/selection
            _.each(this.participants, function(participant) {
                this.cursorMove(participant.userId, participant.cursor.x, participant.cursor.y);
                this.selectionMove(participant.userId,
                    participant.selection.start.x, participant.selection.start.y,
                    participant.selection.end.x, participant.selection.end.y);
            }, this);
            
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

                //logging.log("send packet", data);
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
                    return that.file.write(that.content_value_t1, args.path)
                    .then(function(newPath) {
                        that.file.modifiedState(false);
                        if (newPath != that.file.path()) {
                            that.trigger("file:path", newPath);
                        }
                    }, function(err) {
                        that.trigger("error", err);
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
         *  Close the connection
         */
        close: function() {
            clearInterval(this.timer);
            this.file.modifiedState(false);
            this.send("close");
            this.off();
        },
    });

    return FileSync;
});