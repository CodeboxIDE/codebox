define([
    "themes",
    "vendors/term",
    "less!stylesheets/tab.less"
], function(THEMES) {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
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
            this.term_w = 80;
            this.term_h = 24;
            this.term_el = $("<div>", {
                'class': "tab-panel-inner terminal-body"
            }).appendTo($("<div>", {"class": "tab-panel-body"}).appendTo(this.$el)).get(0);

            // Get theme
            this.theme = THEMES[settings.get("theme", 'solarized_dark')];

            // New terminal
            this.term = new Terminal({
                cols: this.term_w,
                rows: this.term_h,
                screenKeys: true,
                useStyle: false,
                scrollback: 1000,
                parent: this.term_el,
                colors: themeColors(this.theme)
            });

            this.term.open(this.term_el);

            this.interval = setInterval(_.bind(this.resize, this), 2000);
            this.clear();

            // Init codebox stream
            this.sessionId = this.options.shellId || _.uniqueId("term");
            this.shell = box.openShell({
                'shellId': this.options.shellId ? this.sessionId : this.sessionId+"-"+(new Date()).getTime()
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
                    that.shell.socket.emit("shell.resize", {
                        "shellId": that.shell.shellId,
                        "rows": that.term_h,
                        "columns": that.term_w
                    });
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

                //this.render();
            }, this);

            // Connect term and stream
            this.term.on('data', function(data) {
                that.shell.stream.write(data);
            });
            this.on("resize", function(w, h) {
                if (!that.connected) return;

                w = w || that.term_w;
                h = h || that.term_h;

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
                "font-family": settings.get("font", "monospace")
            });
            $(this.term_el).css({
                'background': this.theme.background,
                'border-color': this.theme.background
            });

            // Resize term
            // Wait till browser has rendered terminal first
            // only then can we resize
            setTimeout(this.resize.bind(this), 0);

            return this.ready();
        },

        // Resize the terminal
        resize: function(w, h) {
            if (!this.options.resize) { return false; }

            w = w || _.min([
                400,
                _.max([Math.floor((this.$el.outerWidth()-10)/8)-1, 10])
            ]);
            h = h || _.min([
                400,
                _.max([Math.floor(this.$el.outerHeight()/20)-1, 10])
            ]);
            if (w == this.term_w && h == this.term_h) {
                return this;
            }
            this.term_w = w;
            this.term_h = h;
            this.term.resize(this.term_w, this.term_h);

            this.trigger("resize", this.term_w, this.term_h);

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
