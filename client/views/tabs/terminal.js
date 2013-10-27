define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "vendors/socket.io-stream",
    "views/tabs/base",
    "core/box"
], function(_, $, hr, ss, BaseTab, box) {
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
            var that = this;
            TerminalTab.__super__.initialize.apply(this, arguments);
            this.connected = false;

            this.sessionId = this.options.shellId || _.uniqueId("term");
            this.shell = box.openShell({
                'shellId': this.options.shellId ? this.sessionId : this.sessionId+"-"+(new Date()).getTime()
            });

            this.on("tab:close", function() {
                this.shell.disconnect();
            }, this);
            this.setTabTitle("Terminal - "+this.sessionId);

            this.shell.on("connect", function() {
                that.connected = true;

                that.shell.stream.once('data', function() {
                    if (that.components.terminal != null) {
                        that.shell.socket.emit("shell.resize", {
                            "shellId": that.shell.shellId,
                            "rows": that.components.terminal.term_h,
                            "columns": that.components.terminal.term_w
                        });
                    }
                });

                that.shell.stream.on('error', function() {
                    that.printLn("Error connecting to remote host");
                });

                that.shell.stream.on('end', function() {
                    that.printLn("Connection closed by remote host");
                });

                that.shell.stream.on('data', function(chunk) {
                    that.print(chunk.toString());
                });

                this.render();
            }, this);


            if (this.options.directConnect) {
                this.shell.connect();
            }
            return this;
        },

        templateContext: function() {
            return {
                'options': {
                    'resize': this.options.resize
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
            var that = this;

            var sendResize = function(w, h) {
                if (!that.connected) return;

                w = w || that.components.terminal.term_w;
                h = h || that.components.terminal.term_h;
                
                that.shell.socket.emit("shell.resize", {
                    "shellId": that.shell.shellId,
                    "rows": h,
                    "columns": w
                });
            };

            this.components.terminal.on("resize", sendResize, this);
            this.components.terminal.on("data", function(data) {
                this.shell.stream.write(data);
            }, this);

            sendResize();

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
        }
    });

    return TerminalTab;
});