define([
    "underscore",
    "hr/hr",
    "utils/keyboard",
], function(_, hr, Keyboard) {
    var logging = hr.Logger.addNamespace("command");

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
            'iconMenu': "sign-blank",

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
        },

        // Add a section to the command menu
        menuSection: function(commands, properties) {
            var section = Command.section(commands, properties);
            this.menu.add(section);
            return this;
        }
    }, {
        // Map of command by ids
        mapIds: {},

        // Register a command
        register: function(commandId, properties) {
            if (_.isObject(commandId)) {
                properties = commandId;
                commandId = properties.id || _.uniqueId("command");
            }

            if (!Command.mapIds[commandId]) {
                logging.log("Register command", commandId);
                Command.mapIds[commandId] = new Command({}, _.extend(properties, {
                    'id': commandId
                }));
            } else {
                throw "Error command already registrated:"+commandId;
            }
            return Command.mapIds[commandId];
        },

        // Return a divider
        divider: function(properties) {
            return _.extend({
                'type': "divider"
            }, properties);
        },

        // Return a section of commands
        section: function(commands, properties) {
            properties = properties || {};
            commands.push(Command.divider(properties));
            commands = _.map(commands, function(command) {
                if (!(command instanceof Command)) {
                    command = Command.register(command);
                }
                command.set(properties);
                return command;
            });
            return commands;
        }
    });

    return Command;
});