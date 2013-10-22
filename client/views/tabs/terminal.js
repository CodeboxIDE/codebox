define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "vendors/socket.io-stream",
    "views/tabs/base",
    "session"
], function(_, $, hr, ss, BaseTab, session) {
    var TerminalTab = BaseTab.extend({
        className: BaseTab.prototype.className+ " component-workspace-terminal",
        template: "tabs/terminal.html",
        defaults: {
            directConnect: true,
            shellId: null,
            resize: true
        },
        events: {
            "click .action-file-fullscreen": "toggleFullscreen"
        },

        initialize: function(options) {
            TerminalTab.__super__.initialize.apply(this, arguments);
            this.stream = ss.createStream();
            this.connected = false;
            this.codebox = session.codebox;
            this.sessionId = _.uniqueId("term");

            this.on("tab:close", function() {
                if (this.connected) {
                    this.socket().emit("shell.destroy", {
                        "shellId": this.shellId
                    });
                    this.socket().disconnect();
                }
            }, this);

            this._shellId = this.options.shellId || this.sessionId;
            this.shellId = this.options.shellId ? this._shellId : this._shellId+"-"+(new Date()).getTime();
            this.setTabTitle("Terminal - "+this._shellId);

            if (this.options.directConnect) {
                this.connect();
            }
            return this;
        },

        templateContext: function() {
            return {
                stream: this.options.terminal ? this.stream : null,
                options: {
                    resize: this.options.resize
                }
            };
        },

        render: function() {
            if (!this.connected) {
                return this;
            }
            return TerminalTab.__super__.render.apply(this, arguments);
        },

        finish: function() {
            this.components.terminal.on("resize", function(w, h) {
                this.socket().emit("shell.resize", {
                    "shellId": this.shellId,
                    "rows": h,
                    "columns": w
                });
            }, this);
            this.components.terminal.on("data", function(data) {
                this.stream.write(data);
            }, this);
            return TerminalTab.__super__.finish.apply(this, arguments);
        },

        /* (action) Toggle fullscreen */
        toggleFullscreen: function(e) {
            e.preventDefault();
            this.$el.toggleClass("mode-fullscreen");
        },

        /* Write a line */
        printLn: function(line) {
            if (this.components.terminal == null) return this;
            this.components.terminal.writeln(line);
            return this;
        },

        /* Write content */
        print: function(buf) {
            if (this.components.terminal == null) return this;
            this.components.terminal.write(buf);
            return this;
        },

        /* Socket for the connexion */
        socket: function() {
            if (this._socket == null && this.codebox != null) {
                this.codebox.socket("stream/shells", true).done(_.bind(function(s) {
                    this._socket = s;
                }, this));
            }
            return this._socket;
        },

        /* Connect to the server */
        connect: function() {
            var that = this;
            if (this.socket() == null) return this;

            var socket = this.socket();

            socket.on("connect", function() {
                that.connected = true;

                // Send stream to server
                ss(socket).emit('shell.open', that.stream, {
                    "shellId": that.shellId,
                    "opts": {
                        "rows": 80,
                        "columns": 24,
                        "id": that.shellId
                        /*
                         * Other options
                        uid: 501,
                        gid: 20,
                        id: "something",  // same as shellId
                        cwd: "/app/"  // Folder to open shell in
                        // ENV variables
                        env: {
                            HOME: "/home/something",
                            DEV: "true"
                        }
                        */
                    }
                });

                that.stream.once('data', function() {
                    if (that.components.terminal != null) {
                        that.socket().emit("shell.resize", {
                            "shellId": that.shellId,
                            "rows": that.components.terminal.term_h,
                            "columns": that.components.terminal.term_w
                        });
                    }
                });

                that.stream.on('error', function() {
                    that.printLn("Error connecting to remote host");
                });

                that.stream.on('end', function() {
                    that.printLn("Connection closed by remote host");
                });

                that.stream.on('data', function(chunk) {
                    that.print(chunk.toString());
                });

                that.render();
            });


            return this;
        }
    });

    return TerminalTab;
});