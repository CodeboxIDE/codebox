define([
    "underscore",
    "hr/hr",
    "utils/keyboard",
], function(_, hr, Keyboard) {
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
            // Command type
            // "divider", "action", "menu"
            'type': "action",

            // Command unique id
            'id': "",

            // Command title
            'title': "",

            // Command help label
            'label': "",

            // Command icon
            'icon': "sign-blank",

            // Command action handler
            'action': function() {},

            // Order position
            'position': 10,

            // Keyboard shortcuts list
            'shortcuts': [],

            // Visible in lateral bar
            'visible': true,

            // Visible in search
            'search': true,

            // Others flags
            'flags': ""
        },

        // Constructor
        initialize: function() {
            Command.__super__.initialize.apply(this, arguments);

            // Default unique id
            if (!this.get("id")) this.set("id", _.uniqueId("command"));

            // Submenu
            var Commands = require("collections/commands");
            this.menu = new Commands();
            this.menu.reset(this.get("menu", []));
        },

        // Run the command
        run: function(args) {
            return this.get("action").apply(this, [args]);
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
        },

        // Has flag
        hasFlag: function(flag) {
            var flags = this.get("flags", "").split(" ");
            return _.contains(flags, flag);
        },

        // Shortcut visible text
        shortcutText: function() {
            var shortcuts = this.get("shortcuts");
            return Keyboard.toText(shortcuts);
        },

        // Label text
        label: function() {
            if (this.get("label")) {
                return this.get("label");
            }
            return this.shortcutText();
        }
    });

    return Command;
});