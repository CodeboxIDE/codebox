define([
    "vendors/term",
    "less!stylesheets/tab.less"
], function() {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var Tab = codebox.require("views/tabs/base");
    var box = codebox.require("core/box");
    var user = codebox.require("core/user");

    var settings = user.settings("terminal");

    // Theme stuff
    // Pulled from https://raw.github.com/AaronO/iterm-colors/master/bundle.json
    var THEMES = {"blazer":{"palette":["#262626","#dbbdbd","#bddbbd","#dbdbbd","#bdbddb","#dbbddb","#bddbdb","#ffffff"],"name":"blazer"},"chalkboard":{"foreground":"#d9e6f2","background":"#29262f","cursor":"#d9e6f2","cursor_text":"#29262f","palette":["#000000","#c37372","#72c373","#c2c372","#7372c3","#c372c2","#72c2c3","#d9d9d9","#323232","#dbaaaa","#aadbaa","#dadbaa","#aaaadb","#dbaada","#aadadb","#ffffff"],"name":"chalkboard"},"dark_pastel":{"foreground":"#ffffff","background":"#000000","cursor":"#bbbbbb","cursor_text":"#ffffff","palette":["#000000","#ff5555","#55ff55","#ffff55","#5555ff","#ff55ff","#55ffff","#bbbbbb","#555555","#ff5555","#55ff55","#ffff55","#5555ff","#ff55ff","#55ffff","#ffffff"],"name":"dark_pastel"},"desert":{"foreground":"#ffffff","background":"#333333","cursor":"#00ff00","cursor_text":"#000000","palette":["#4d4d4d","#ff2b2b","#98fb98","#f0e68c","#cd853f","#ffdead","#ffa0a0","#f5deb3","#555555","#ff5555","#55ff55","#ffff55","#87ceff","#ff55ff","#ffd700","#ffffff"],"name":"desert"},"espresso":{"foreground":"#ffffff","background":"#323232","cursor":"#d6d6d6","cursor_text":"#ffffff","palette":["#343434","#d25151","#a5c261","#ffc66d","#6c99bb","#d197d9","#bed6ff","#eeeeec","#535353","#f00c0c","#c2e075","#e1e38b","#8ab7d9","#efb5f7","#dcf3ff","#ffffff"],"name":"espresso"},"github":{"foreground":"#3e3e3e","background":"#f4f4f4","cursor":"#3f3f3f","cursor_text":"#f4f4f4","palette":["#3e3e3e","#970b16","#07962a","#f8eec7","#003e8a","#e94691","#89d1ec","#ffffff","#666666","#de0000","#87d5a2","#f1d007","#2e6cba","#ffa29f","#1cfafe","#ffffff"],"name":"github"},"grass":{"foreground":"#fff0a5","background":"#13773c","cursor":"#8c2800","cursor_text":"#ffffff","palette":["#000000","#bb0000","#00bb00","#e7b000","#0000a3","#950061","#00bbbb","#bbbbbb","#555555","#bb0000","#00bb00","#e7b000","#0000bb","#ff55ff","#55ffff","#ffffff"],"name":"grass"},"homebrew":{"foreground":"#00ff00","background":"#000000","cursor":"#23ff18","cursor_text":"#ff0017","palette":["#000000","#990000","#00a600","#999900","#0000b2","#b200b2","#00a6b2","#bfbfbf","#666666","#e50000","#00d900","#e5e500","#0000ff","#e500e5","#00e5e5","#e5e5e5"],"name":"homebrew"},"hurtado":{"foreground":"#dadbda","background":"#000000","cursor":"#bbbbbb","cursor_text":"#ffffff","palette":["#575757","#ff1b00","#a5df55","#fbe74a","#486387","#fc5ef0","#85e9fe","#cbcbcb","#252525","#d41c00","#a5df55","#fbe749","#89bdff","#bf00c0","#85e9fe","#dbdbdb"],"name":"hurtado"},"idletoes":{"foreground":"#ffffff","background":"#323232","cursor":"#d6d6d6","cursor_text":"#000000","palette":["#323232","#d25252","#7fe173","#ffc66d","#4098ff","#f57fff","#bed6ff","#eeeeec","#535353","#f07070","#9dff90","#ffe48b","#5eb7f7","#ff9dff","#dcf4ff","#ffffff"],"name":"idletoes"},"kibble":{"foreground":"#f7f7f7","background":"#0e100a","cursor":"#9fda9c","cursor_text":"#000000","palette":["#4d4d4d","#c70031","#29cf13","#d8e30e","#3449d1","#8400ff","#0798ab","#e2d1e3","#5a5a5a","#f01578","#6ce05c","#f3f79e","#97a4f7","#c495f0","#68f2e0","#ffffff"],"name":"kibble"},"man_page":{"foreground":"#000000","background":"#fef49c","cursor":"#7f7f7f","cursor_text":"#000000","palette":["#000000","#cc0000","#00a600","#999900","#0000b2","#b200b2","#00a6b2","#cccccc","#666666","#e50000","#00d900","#e5e500","#0000ff","#e500e5","#00e5e5","#e5e5e5"],"name":"man_page"},"monokai_soda":{"foreground":"#c4c4b5","background":"#191919","cursor":"#f6f6ec","cursor_text":"#c4c4b5","palette":["#191919","#f3005f","#97e023","#fa8419","#9c64fe","#f3005f","#57d1ea","#c4c4b5","#615e4b","#f3005f","#97e023","#dfd561","#9c64fe","#f3005f","#57d1ea","#f6f6ee"],"name":"monokai_soda"},"neopolitan":{"foreground":"#ffffff","background":"#17130f","cursor":"#ffffff","cursor_text":"#ffffff","palette":["#17130f","#800000","#61ce3c","#fbde2d","#253b76","#ff0080","#8da6ce","#f8f8f8","#17130f","#800000","#61ce3c","#fbde2d","#253b76","#ff0080","#8da6ce","#f8f8f8"],"name":"neopolitan"},"novel":{"foreground":"#3b2322","background":"#dfdbc3","cursor":"#73635a","cursor_text":"#000000","palette":["#000000","#cc0000","#009600","#d06b00","#0000cc","#cc00cc","#0087cc","#cccccc","#7f7f7f","#cc0000","#009600","#d06b00","#0000cc","#cc00cc","#0086cb","#ffffff"],"name":"novel"},"ocean":{"foreground":"#ffffff","background":"#224fbc","cursor":"#7f7f7f","cursor_text":"#ffffff","palette":["#000000","#990000","#00a600","#999900","#0000b2","#b200b2","#00a6b2","#bfbfbf","#666666","#e50000","#00d900","#e5e500","#0000ff","#e500e5","#00e5e5","#e5e5e5"],"name":"ocean"},"pro":{"foreground":"#f2f2f2","background":"#000000","cursor":"#4d4d4d","cursor_text":"#ffffff","palette":["#000000","#990000","#00a600","#999900","#1f08db","#b200b2","#00a6b2","#bfbfbf","#666666","#e50000","#00d900","#e5e500","#0000ff","#e500e5","#00e5e5","#e5e5e5"],"name":"pro"},"red_sands":{"foreground":"#d7c9a7","background":"#79241e","cursor":"#ffffff","cursor_text":"#000000","palette":["#000000","#ff3f00","#00bb00","#e7b000","#0071ff","#bb00bb","#00bbbb","#bbbbbb","#555555","#bb0000","#00bb00","#e7b000","#0071ae","#ff55ff","#55ffff","#ffffff"],"name":"red_sands"},"seafoam_pastel":{"foreground":"#d3e7d3","background":"#243434","cursor":"#576479","cursor_text":"#323232","palette":["#757575","#825d4d","#718c61","#ada16d","#4d7b82","#8a7167","#719393","#e0e0e0","#8a8a8a","#cf9379","#98d9aa","#fae79d","#79c3cf","#d6b2a1","#ade0e0","#e0e0e0"],"name":"seafoam_pastel"},"solarized_darcula":{"foreground":"#d2d8d9","background":"#3d3f41","cursor":"#708183","cursor_text":"#002731","palette":["#25292a","#f24840","#629655","#b68800","#2075c7","#797fd4","#15968d","#d2d8d9","#25292a","#f24840","#629655","#b68800","#2075c7","#797fd4","#15968d","#d2d8d9"],"name":"solarized_darcula"},"solarized_dark":{"foreground":"#708183","background":"#001e26","cursor":"#708183","cursor_text":"#002731","palette":["#002731","#d01b24","#728905","#a57705","#2075c7","#c61b6e","#259185","#e9e2cb","#001e26","#bd3612","#465a61","#52676f","#708183","#5856b9","#81908f","#fcf4dc"],"name":"solarized_dark"},"solarized_light":{"foreground":"#52676f","background":"#fcf4dc","cursor":"#52676f","cursor_text":"#e9e2cb","palette":["#002731","#d01b24","#728905","#a57705","#2075c7","#c61b6e","#259185","#e9e2cb","#001e26","#bd3612","#465a61","#52676f","#708183","#5856b9","#81908f","#fcf4dc"],"name":"solarized_light"},"symfonic":{"foreground":"#ffffff","background":"#000000","cursor":"#dc322f","cursor_text":"#ffffff","palette":["#000000","#dc322f","#56db3a","#ff8400","#0084d4","#b729d9","#ccccff","#ffffff","#1b1d21","#dc322f","#56db3a","#ff8400","#0084d4","#b729d9","#ccccff","#ffffff"],"name":"symfonic"},"terminal_basic":{"foreground":"#000000","background":"#ffffff","cursor":"#7f7f7f","cursor_text":"#000000","palette":["#000000","#990000","#00a600","#999900","#0000b2","#b200b2","#00a6b2","#bfbfbf","#666666","#e50000","#00d900","#e5e500","#0000ff","#e500e5","#00e5e5","#e5e5e5"],"name":"terminal_basic"},"vaughn":{"foreground":"#dcdccc","background":"#25234e","cursor":"#ff5555","cursor_text":"#ffffff","palette":["#24234f","#705050","#60b48a","#dfaf8f","#5555ff","#f08cc3","#8cd0d3","#709080","#709080","#dca3a3","#60b48a","#f0dfaf","#5555ff","#ec93d3","#93e0e3","#ffffff"],"name":"vaughn"},"zenburn":{"foreground":"#dcdccc","background":"#3f3f3f","cursor":"#73635a","cursor_text":"#000000","palette":["#4d4d4d","#705050","#60b48a","#f0dfaf","#506070","#dc8cc3","#8cd0d3","#dcdccc","#709080","#dca3a3","#c3bf9f","#e0cf9f","#94bff3","#ec93d3","#93e0e3","#ffffff"],"name":"zenburn"}};

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

        initialize: function(options) {
            var that = this;
            TerminalTab.__super__.initialize.apply(this, arguments);
            this.connected = false;

            // Init rendering
            this.term_w = 80;
            this.term_h = 24;
            this.term_el = $("<div>", {
                'class': "tab-panel-inner terminal-body"
            }).appendTo($("<div>", {"class": "tab-panel-body"}).appendTo(this.$el)).get(0);

            // New terminal
            this.term = new Terminal({
                cols: this.term_w,
                rows: this.term_h,
                screenKeys: true,
                useStyle: false,
                scrollback: 0,
                parent: this.term_el,
                colors: themeColors(THEMES[settings.theme || 'solarized_dark'])
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
            this.resize();
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

            this.trigger("resize", this.term_w, this.term_h)

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
