define([
    "themes",
    "vendors/sh",
    "less!stylesheets/tab.less"
], function(THEMES, Terminal) {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");
    var Tab = codebox.require("views/tabs/base");
    var box = codebox.require("core/box");
    var user = codebox.require("core/user");

    var settings = user.settings("terminal");

    // Build colors array for a given theme object
    function themeColors(theme) {
        // Copy pallette
        var colors = theme.palette;

        // Set background and forground colors if available
        if(theme.background) colors[256] = theme.background;
        if(theme.foreground) colors[257] = theme.foreground;

        return colors;
    }

    console.log(Terminal);

    var TerminalTab = Tab.extend({
        className: Tab.prototype.className+ " addon-terminal-tab",
        defaults: {
            shellId: null,
            resize: true
        },
        menuTitle: "Terminal",

        initialize: function(options) {
            var that = this;
            TerminalTab.__super__.initialize.apply(this, arguments);
            this.connected = false;

            // Init menu
            this.menu.menuSection([
                {
                    'type': "checkbox",
                    'title': "Exit",
                    'action': function(state) {
                        that.closeTab();
                    }
                }
            ]);

            // Init rendering
            this.term_el = $("<div>", {
                'class': "tab-panel-inner terminal-body"
            }).appendTo($("<div>", {"class": "tab-panel-body"}).appendTo(this.$el)).get(0);

            // Get theme
            this.theme = THEMES[settings.get("theme", 'solarized_dark')];

            // New terminal
            this.term = new Terminal(80, 24);
            this.term.open(this.term_el);

            this.interval = setInterval(_.bind(this.resize, this), 2000);
            this.clear();

            // Init codebox stream
            this.sessionId = this.options.shellId || _.uniqueId("term");
            this.shell = box.openShell({
                'shellId': this.options.shellId ? this.sessionId : this.sessionId+"-"+(new Date()).getSeconds()
            });

            this.on("tab:close", function() {
                clearInterval(this.interval);
                this.shell.disconnect();
                this.term.destroy();
            }, this);
            this.on("tab:state", function(state) {
                if (state) this.term.focus();
            }, this);

            this.setTabTitle("Terminal - "+this.sessionId);

            this.shell.on("connect", function() {
                that.connected = true;

                that.shell.stream.once('data', function() {
                    that.resize();
                });

                that.shell.stream.on('error', function() {
                    that.writeln("Error connecting to remote host");
                });

                that.shell.stream.on('end', function() {
                    that.writeln("Connection closed by remote host");
                    that.closeTab();
                });

                that.shell.stream.on('data', function(chunk) {
                    that.write(chunk.toString());
                });

                that.trigger("terminal:ready");
            }, this);

            // Connect term and stream
            this.term.on('data', function(data) {
                that.shell.stream.write(data);
            });
            this.term.on("resize", function(w, h) {
                if (!that.connected) return;

                that.shell.socket.emit("shell.resize", {
                    "shellId": that.shell.shellId,
                    "rows": h,
                    "columns": w
                });
            });

            this.shell.connect();
            return this;
        },

        // Render
        render: function() {
            this.$el.css({
                "font-family": settings.get("font", "monospace"),
                "font-size": settings.get("size", 13)+'px',
                "line-height": settings.get("line-height", 1.3)            
            });
            $(this.term_el).css({
                'background': this.theme.background,
                'border-color': this.theme.background
            });

            return this.ready();
        },

        // Resize the terminal
        resize: function() {
            if (!this.options.resize) { return false; }

            var w = this.$el.width();
            var h = this.$el.height();

            if (w != this._width || h != this._height) {
                this._width = w;
                this._height = h;
                this.term.sizeToFit();
            }

            return this;
        },

        // Write
        write: function(content) {
            this.term.write(content);
            return this;
        },

        // Write a line
        writeln: function(line) {
            return this.write(line+"\r\n");
        },

        // Clear
        clear: function() {
            return this.write("\033[H\033[2J");
        }
    });

    return TerminalTab;
});
