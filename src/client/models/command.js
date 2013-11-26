define([
    "underscore",
    "hr/hr"
], function(_, hr) {
    Array.prototype.remove = function(val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === val) {
                this.splice(i, 1);
                i--;
            }
        }
        return this;
    };

    var Command = hr.Model.extend({
        defaults: {
            'id': "",
            'title': "",
            'icon': "sign-blank",
            'handler': function() {},

            // Options
            'position': 2,
            'shortcuts': [],
            'visible': true,   // Visible in lateral bar
            'search': true,    // Visible in search,
            'flags': ""        // Command class flag
        },

        // Run the command
        run: function(args) {
            return this.get("handler").apply(this, [args]);
        },

        // Toggle flag
        toggleFlag: function(flag, state) {
            var flags = this.get("flags", "").split(" ");

            if (state == null)  state = !_.contains(flags, flag);
            if (state) {
                flags.push(flag);
            } else {
                flags.remove(flag);
            }
            this.set("flags", _.uniq(flags).join(" "));
        }
    });

    return Command;
});