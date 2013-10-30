define([
    "hr/hr",
    "vendors/diff_match_patch",
    "vendors/crypto",
    "core/user"
], function(hr, diff_match_patch, CryptoJS, user) {

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

        // Constructor
        initialize: function() {
            FileSync.__super__.initialize.apply(this, arguments);

            this.diff = new diff_match_patch();
            this.selections = {};
            this.cursors = {};
            this.synced = false;
            this.file = null;
            this.sync = false;  // sync is enabled or disabled
            this.ping = false;  // ping
            this.participants = []; // participants list
            this.syncState = false; // sync connexion state

            // Add timer for ping
            this.timer = setInterval(_.bind(this._intervalPing, this), 15*1000);

            // Init file
            if (this.options.file) {
                this.setFile(this.options.file);
            }
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
            if (!this.isSync()) return this;

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
            this.file.setCache(this.content_value_t1);
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
            return (this.file != null && this.sync == true);
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
        updateFile: function(options) {
            var socket, self;
            self = this;

            options = _.defaults({}, options || {}, {
                cache: true
            });

            // Set mode
            this.trigger("mode", this.file.mode());

            // Read file
            this.file.download({
                cache: options.cache
            }).done(_.bind(function(content) {
                this.setContent(content);
            }, this));

            // Connect to file
            if (this.sync) {
                this.setSyncState(false);
                socket = this.socket();
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
                    logging.log("socket editor packet ", data);
                    self.ping = true;
                    if (data.action == null || data.path == null || self.file.path() != data.path) {
                        return;
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
                                self.synced = true;
                                self.setContent(data.content);
                            }
                            if (data.participants != null) {
                                self.setParticipants(data.participants)
                            }
                            break;
                        case "patch":
                            if (data.patch != null) {
                                self.patchContent(data);
                            }
                            break;
                    }
                    self.setSyncState(true);
                });

                this.sendSync();
            }
        },

        /*
         *  Set file to the editor
         */
        setFile: function(file, options) {
            options = _.defaults({}, options || {}, {
                sync: true,
                readonly: false,
                cache: true
            });
            if (!file.isValid()) return;

            logging.log("init file with options ", options);
            this.sync = options.sync;
            options.readonly = this.sync ? options.readonly : true;
            this.file = file;
            if (this.file != null) {
                this.file.on("set", _.partial(this.updateFile, options), this);
                this.updateFile(options);
            }
        },

        /* Socket for the connexion */
        socket: function() {
            if (this.file != null) {
                var socket = null;
                this.file.codebox.socket("filesync").done(_.bind(function(s) {
                    socket = s;
                }, this));
                return socket;
            } else {
                return null;
            }
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
            this.participants = _.map(parts, function(participant, i) {
                participant.color = this.options.colors[i % this.options.colors.length];
                return participant;
            }, this);
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
            if (this.file != null && action != null) {
                data = _.extend({}, data || {}, {
                    'action': action,
                    'from': user.get("userId"),
                    'token': user.get("token"),
                    'path': this.file.path()
                });

                var socket = this.socket();
                if (socket != null) {
                    socket.json.send(data);
                }
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
         *  Send request to absolute sync to the server
         */
        sendSync: function() {
            this.send("sync");
            return true;
        }
    });

    return FileSync;
});