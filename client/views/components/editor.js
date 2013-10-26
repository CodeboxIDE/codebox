define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "vendors/diff_match_patch",
    "vendors/crypto",
    "config",
    "session",
], function(_, $, hr, diff_match_patch, CryptoJS, config, session) {

    var ace_init = false;
    var logging = hr.Logger.addNamespace("editor");

    var EditorView = hr.View.extend({
        className: "component-editor",
        defaults: {
            mode: "text",
            theme: config.editor.default_theme,
            fontsize: "12",
            printmargincolumn: 80,
            showprintmargin: false,
            highlightactiveline: false,
            wraplimitrange: 80,
            enablesoftwrap: false,
            keyboard: config.editor.default_keyboard,
            readonly: false,
            colors: [
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
        events: {
            
        },

        initialize: function(options) {
            var self = this;

            this.baseOptions = _.clone(options);
            EditorView.__super__.initialize.apply(this, arguments);

            // Configure ace
            if (!ace_init) {
                ace_init = true;
                var config = ace.require("ace/config");
                config.set("basePath", "static/ace");
            }

            // Create base ace editor instance
            this.diff = new diff_match_patch();
            this.selections = {};
            this.cursors = {};
            this.synced = false;
            this.file = null;
            this.sync = false;  // sync is enabled or disabled
            this.ping = false;  // ping
            this.participants = []; // participants list
            this.syncState = false; // sync conenxion state
            this.editor = ace.edit(this.el);
            this.editor.session.setUseWorker(true);
            this.setOptions(options);

            // Bind settings changement
            session.user.on("change:settings.editor", function() {
                var ops = _.clone(this.baseOptions);
                _.extend(ops, {
                    "mode": this.options.mode,
                    "readonly": this.options.readonly
                });
                this.setOptions(ops);
            }, this);

            // Bind editor changement
            this.editor.getSession().selection.on('changeSelection', function(){
                if (self.isSync()) {
                    var selection = self.editor.getSelectionRange();
                    self.sendSelection(selection.start.column, selection.start.row, selection.end.column, selection.end.row);
                }
            });
            this.editor.getSession().selection.on('changeCursor', function(){
                if (self.isSync()) {
                    var c = self.editor.getSession().getSelection().getCursor();
                    var x = c.column;
                    var y = c.row;
                    self.sendCursor(x, y);
                }
            });
            this.editor.getSession().on('changeFrontMarker', function(e){
                self.cursorsRender();
            });
            this.editor.getSession().on('changeBackMarker', function(e,data){
                self.cursorsRender();
            });
            this.editor.getSession().doc.on('change', function(d) {
                if (self.isSync()) {
                    /* Ancien contenu */
                    self.hash_value_t0 = self.hash_value_t1;

                    /* Contenu actuel */
                    self.content_value_t1 = self.editor.session.getValue();
                    self.hash_value_t1 = String(CryptoJS.MD5(self.content_value_t1));

                    /* Creation du patch */
                    var diff_data = self.diff.diff_main(self.content_value_t0, self.content_value_t1, true);
                    var patch_list = self.diff.patch_make(self.content_value_t0, self.content_value_t1, diff_data);
                    var patch_text = self.diff.patch_toText(patch_list);

                    
                    /* Changement du temps */
                    self.content_value_t0 = self.content_value_t1;

                    /* Envoie du patch au serveur */
                    self.sendPatch(patch_text, self.hash_value_t0, self.hash_value_t1);
                    self.file.setCache(self.content_value_t1);
                }
            });

            // Commands
            this.editor.commands.addCommand({
                name: 'save',
                bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
                exec: _.bind(function(editor) {
                    
                }, this)
            });

            // Add timer for ping
            this.timer = setInterval(_.bind(this._intervalPing, this), 15*1000);

            return this.render();
        },

        finish: function() {
            return EditorView.__super__.finish.apply(this, arguments);
        },

        render: function() {
            this.editor.resize();
            this.editor.renderer.updateFull();
            return this.ready();
        },

        _intervalPing: function(){
            if (!this.isSync()) return;
            if (this.synced == false) {
                this.sendSync();
            } else {
                this.sendPing();
                this.setSyncState(self.ping == true);
                this.ping = false;
            }
        },
        
        focus: function() {
            this.editor.focus();
            return this;
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
        isSyncGood: function() {
            return (this.isSync() && this.syncState);
        },

        /*
         *  Set editor options: theme, fontsize, ...
         */
        setOptions: function(opts) {
            this.options = opts;

            // Define default with user settings
            var defaults = _.clone(this.defaults);

            // Extend configs
            defaults = _.extend(defaults, session.user.get("settings.editor"));
            this.options = _.extend(defaults, this.options);

            this.setMode(this.options.mode);
            this.setKeyboardmode(this.options.keyboard);
            this.setTheme(this.options.theme);
            this.setFontsize(this.options.fontsize);
            this.setPrintmargincolumn(this.options.printmargincolumn);
            this.setShowprintmargin(this.options.showprintmargin);
            this.setHighlightactiveline(this.options.highlightactiveline);
            this.setEnablesoftwrap(this.options.enablesoftwrap);
            this.setWraplimitrange(this.options.wraplimitrange);
            this.setReadonly(this.options.readonly);
            return this;
        },

        /*
         *  Get editor mode
         */
        getMode: function() {
            return this.options.mode;
        },

        /*
         *  Set editor mode
         *  @lang : editor lang mode
         */
        setMode: function(lang) {
            this.options.mode = lang;
            this.editor.getSession().setMode("ace/mode/"+lang);
            this.trigger("change:mode");
            return this;
        },

        /*
         *  Set editor keyboard mode
         *  @mode: keyboard mode (vim, emacs)
         */
        setKeyboardmode: function(mode) {
            var self = this;
            this.options.keyboard = mode;
            ace.config.loadModule(["keybinding", "ace/keyboard/"+self.options.keyboard], function(binding) {
                if (binding && binding.handler) {
                    self.editor.setKeyboardHandler(binding.handler);
                    self.trigger("change:keyboardmode");
                }
            });
            return this;
        },

        /*
         *  Set font size
         *  @fontsize : font size for the editor text
         */
        setFontsize: function(fontsize) {
            this.options.fontsize = fontsize;
            this.$el.css("fontSize",fontsize+"px");
            this.trigger("change:fontsize");
            return this;
        },

        /*
         *  Set print margin column
         *  @value : number of column for print margin
         */
        setPrintmargincolumn: function(value) {
            this.options.printmargincolumn = value;
            this.editor.setPrintMarginColumn(this.options.printmargincolumn);
            return this;
        },

        /*
         *  Set show print margin column
         *  @value : number of column for print margin
         */
        setShowprintmargin: function(value) {
            this.options.showprintmargin = value;
            this.editor.setShowPrintMargin(this.options.showprintmargin);
            return this;
        },

        /*
         *  Set highlight active line
         *  @value : boolean : true => highlight all the active line
         */
        setHighlightactiveline: function(value) {
            this.options.highlightactiveline = value;
            this.editor.setHighlightActiveLine(this.options.highlightactiveline);
            return this;
        },

        /*
         *  Set wrap limit range
         */
        setWraplimitrange: function(value) {
            this.options.wraplimitrange = value;
            this.editor.getSession().setWrapLimitRange(this.options.wraplimitrange, this.options.wraplimitrange);
            return this;
        },

        /*
         *  Set enable soft wrap
         */
        setEnablesoftwrap: function(value) {
            this.options.enablesoftwrap = value;
            this.editor.getSession().setUseWrapMode(this.options.enablesoftwrap);
            return this;
        },

        /*
         *  Set theme
         *  @theme_name : name of the theme
         */
        setTheme: function(theme_name) {
            this.options.theme = theme_name;
            this.editor.setTheme("ace/theme/" + theme_name);
            this.trigger("change:theme");
            return this;
        },

        /*
         *  Set read only mode
         *  @b : boolean for read only mode
         */
        setReadonly: function(b) {
            this.readonly = b;
            this.editor.setReadOnly(b);
            return this;
        },

        /*
         *  Return brut content of the editor
         */
        getContent: function() {
            return this.editor.session.getValue();
        },

        /*
         *  Define brut content of the editor
         */
        setContent: function(v) {
            // Save cursor
            var cursor = this.editor.getSession().getSelection().selectionLead.getPosition();

            var oldmode_sync = this.sync;

            // Stop sync and update content
            this.sync = false;
            this.hash_value_t1 = String(CryptoJS.MD5(v));
            this.content_value_t0 = v;
            this.content_value_t1 = v;
            this.editor.session.setValue(v);
            if (this.file != null) {
                this.file.setCache(v);
            }
            this.sync = oldmode_sync;

            this.render();

            // Update cursor
            this.editor.getSession().getSelection().selectionLead.setPosition(cursor[1], cursor[0]);
            return this;
        },

        /*
         *  Apply patch to editor content
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

            // Calcul new cursors
            var scroll_y = this.editor.getSession().getScrollTop();
            var cursor = this.editor.getSession().getSelection().selectionLead.getPosition();
            cursor = this.cursorPatch(cursor, patches);

            // Set editor content
            this.setContent(newtext);

            // Move cursors
            cursor = this.cursorPosByindex(cursor)
            this.editor.getSession().setScrollTop(scroll_y);
            this.editor.getSession().getSelection().selectionLead.setPosition(cursor[1], cursor[0]);
            return true;
        },

        /*
         *  Update file
         */
        updateFile: function(options) {
            var socket, self;
            self = this;
            
            this.setReadonly(options.readonly);

            // Set mode
            this.setMode(this.file.mode());

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
                            if (data.from != session.user.get("userId")) {
                                self.cursorMove(data.from, data.cursor.x, data.cursor.y);
                            }
                            break;
                        case "select":
                            if (data.from != session.user.get("userId")) {
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
            options = _.defaults(options || {}, {
                sync: true,
                readonly: false,
                cache: true
            });
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
                logging.log("creating socket");
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
            this.setReadonly(!this.syncState);
            return this;
        },

        /*
         *  Move a cursor to a position by id
         *  @id : cursor id
         *  @x : position x of the cursor (column)
         *  @y : position y of the cursor (line)
         */
        cursorMove: function(id, x, y) {
            if (session.user.get("userId") == id) {
                return this;
            }
            if (this.cursors[id] != null) {
                this.editor.getSession().removeMarker(this.cursors[id]);
            }

            var CRange = ace.require('ace/range').Range;
            var range = new CRange(y, x, y, x+1);
            var color = this.participantColor(id);
            this.cursors[id] = this.editor.getSession().addMarker(range, "marker-cursor marker-"+color.replace("#", ""),"text",true);
            return this;
        },

        /*
         *  Cursors clear
         */
        cursorsClear: function() {
            var self = this;
            _.each(this.cursors, function(cid, userId) {
                self.editor.getSession().removeMarker(cid);
            });
            _.each(this.selections, function(cid, userId) {
                self.editor.getSession().removeMarker(cid);
            });
            return this;
        },

        /*
         *  Render cursors
         */
        cursorsRender: function() {
            _.each(this.participants, function(participant) {
                this.$(".web-selection-"+participant.userId).css("background", participant.color);
                this.$(".web-cursor-"+participant.userId).css("borderColor", participant.color);
            }, this);
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
            if (session.user.get("userId") == id) {
                return this;
            }
            if (this.selections[id] != null) {
                this.editor.getSession().removeMarker(this.selections[id]);
            }

            var CRange = ace.require('ace/range').Range;
            var range = new CRange(sy, sx, ey, ex);
            var color = this.participantColor(id);
            this.selections[id] = this.editor.getSession().addMarker(range,"marker-selection marker-"+color.replace("#", ""),"line",false);
            return this;
        },

        /*
         *  Return a cursor position by text index
         *  @index : index of the cursor in the text
         */
        cursorPosByindex: function(index) {
            var x = 0;
            var y = 0;

            if (index < 0)
            {
                return [x,y];
            }

            for (var i = 0; i< this.content_value_t0.length; i++){
                var c = this.content_value_t0[i];
                if (index == i){
                    break;
                }
                x = x +1;
                if (c == "\n"){
                    x = 0;
                    y = y +1;
                }
            }
            return [x,y];
        },

        /*
         *  Return index by cursor position
         *  @cx : cursor position x (column)
         *  @cy : cursor position y (line)
         */
        cursorIndexBypos: function(cx, cy){
            var x = 0;
            var y = 0;
            var index = 0;
            for (var i = 0; i< this.content_value_t0.length; i++){
                index = i;
                var c = this.content_value_t0[i];
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
         *  @cursor : ace cursor object {column:, row:}
         *  @patches : diff patches to apply
         */
        cursorPatch: function(cursor, patches){
            var self = this;

            var cursor_x = cursor.column;
            var cursor_y = cursor.row;

            var cursor_index = self.cursorIndexBypos(cursor_x, cursor_y);

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
                data.action = action;
                data.from = session.user.get("userId");
                data.token = session.user.get("token");
                data.path = this.file.path();

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
            return this.send("ping", {});
        },

        /*
         *  Send request to sync to the server
         */
        sendSync: function() {
            this.send("sync", {});
            return true;
        }
    });
    hr.View.Template.registerComponent("component.editor", EditorView);

    return EditorView;
});