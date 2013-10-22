define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "vendors/term",
], function(_, $, hr, Terminal) {
    var logging = hr.Logger.addNamespace("terminal");

    var TerminalView = hr.View.extend({
        className: "component-terminal",
        defaults: {
            resize: true
        },
        events: {
        },

        initialize: function(options) {
            var that = this;
            TerminalView.__super__.initialize.apply(this, arguments);
            this.buffer = "";
            this.term_w = 80;
            this.term_h = 24;
            this.term_el = $("<div>").appendTo(this.$el).get(0);
            this.term = new Terminal({
                cols: this.term_w,
                rows: this.term_h,
                screenKeys: true,
                useStyle: true
            });
            this.term.on('data', function(data) {
                that.trigger("data", data);
            });
            this.term.on('title', function(title) {
                that.trigger("title", title)
            });
            this.term.open(this.term_el);

            setInterval(_.bind(this.resize, this), 2000);
            this.clear();
            return this;
        },

        render: function() {
            this.resize();
            return this.ready();
        },

        /* Resize the terminal */
        resize: function(w, h) {
            if (!this.options.resize) { return false; }
            
            w = w || _.min([
                400,
                _.max([Math.floor(this.$el.outerWidth()/8)-1, 10])
            ]);
            h = h || _.min([
                400,
                _.max([Math.floor(this.$el.outerHeight()/21), 10])
            ]);
            if (w == this.term_w && h == this.term_h) {
                return this;
            }
            this.term_w = w;
            this.term_h = h;
            this.term.resize(this.term_w, this.term_h);
            logging.log("resize terminal to "+this.term_w+"x"+this.term_h);

            this.trigger("resize", this.term_w, this.term_h)

            return this;
        },

        /* Write */
        write: function(content) {
            this.term.write(content);
            return this;
        },

        /* Write a line */
        writeln: function(line) {
            return this.write(line+"\r\n");
        },

        /* Clear */
        clear: function() {
            return this.write("\033[H\033[2J");
        },
    });
    hr.View.Template.registerComponent("component.terminal", TerminalView);

    return TerminalView;
});