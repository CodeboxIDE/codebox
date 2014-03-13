define([], function() {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");

    var ConsoleSection = hr.View.extend({
        className: "debug-section debug-console",
        title: "Console",
        defaults: {
            dbg: null
        },
        events: {
            "click": "focus"
        },
        logIcons: {
            'log': "fa fa-blank",
            'input': "fa fa-angle-right",
            'error': "fa fa-times-circle"
        },

        initialize: function(options) {
            var that = this;
            ConsoleSection.__super__.initialize.apply(this, arguments);
            
            // Debugger client
            this.dbg = this.options.dbg;

            this.$title = $("<h4>", {
                'text': this.title
            });

            this.$container = $("<div>", {
                'class': "table-container"
            });

            this.$body = $("<div>", {
                'class': "console-body"
            });

            this.$input = $("<input>", {
                'class': "form-control input-sm",
                'keyup': function(e) {
                    var key = e.which || e.keyCode;
                    var code = $(e.currentTarget).val();

                    if (key == 13) {
                        /* ENTER */
                        e.preventDefault();

                        that.eval(code);
                        $(e.currentTarget).val("");
                    }
                }
            });

            
            this.$body.appendTo(this.$container);
            this.$input.appendTo($("<div>", {
                'class': "line input",
                'html': '<i class="fa fa-angle-right"></i>'
            }).appendTo(this.$container));

            this.$title.appendTo(this.$el);
            this.$container.appendTo(this.$el);

            return this;
        },

        addLine: function(output) {
            var $line = $("<div>", {
                'class': "line "+output.type
            });
            var $pre = $("<pre>", {
                'text': output.content
            });
            var $icon = $("<i>", {
                'class': this.logIcons[output.type]
            });

            $icon.appendTo($line);
            $pre.appendTo($line);

            $line.appendTo(this.$body);

            // Scroll
            this.$container.animate({ scrollTop: this.$container[0].scrollHeight}, 100);
        },

        // Eval some code
        eval: function(code) {
            this.addLine({
                type: "input",
                content: code
            });
            return this.dbg.eval(code)
            .then(_.bind(this.addLine, this));
        },

        // Focus the console
        focus: function(e) {
            if (e) e.preventDefault();
            this.$input.focus();
        }
    });

    return ConsoleSection;
});
