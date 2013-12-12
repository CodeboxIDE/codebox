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
            'menu': [],
            'handler': function() {},

            // Options
            'position': 10,
            'shortcuts': [],
            'visible': true,   // Visible in lateral bar
            'search': true,    // Visible in search,
            'flags': ""        // Command class flag
        },

        // Return menu items
        menuItems: function() {
            var menuItems = this.get("menu", []);
            if (_.isFunction(menuItems)) menuItems = menuItems();
            return menuItems;
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