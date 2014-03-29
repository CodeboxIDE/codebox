define([
    "hr/utils",
    "hr/hr",
    "utils/keyboard",
    "utils/string"
], function(_, hr, Keyboard, string) {
    var logging = hr.Logger.addNamespace("command");

    var Command = hr.Model.extend({
        defaults: {
            // Command type
            // "divider", "action", "menu", "operation", "label"
            'type': "action",

            // Command unique id
            'id': "",

            // Representation
            'category': "", // Category for this command ("Workspace", "Deployment", ...)
            'title': "", // Title for menu, tip, ...
            'description': "", // Short description
            'label': "", // Help label
            'icons': {
                'default': "sign-blank",
                'menu': "sign-blank",
                'search': "sign-blank"
            },

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

            // Offline mode
            'offline': null,

            // Bind keyboard
            'bindKeyboard': true,

            // Others flags
            'flags': ""
        },

        // Constructor
        initialize: function() {
            var that = this;
            Command.__super__.initialize.apply(this, arguments);

            // Default unique id
            if (!this.get("id")) this.set("id", _.uniqueId("command"));

            // Submenu
            var Commands = require("collections/commands");
            this.menu = new Commands();
            this.menu.reset(this.get("menu", []));

            if (this.get("offline") !== null) {
                this.listenTo(hr.Offline, "state", function() {
                    this.toggleFlag("disabled", this.get("offline") == hr.Offline.isConnected());
                });
                that.toggleFlag("disabled", that.get("offline") == hr.Offline.isConnected())
            }
        },

        // Run the command
        run: function(args) {
            var that = this;
            if (this.hasFlag("disabled")) {
                return false;
            }
            
            var result = this.get("action").apply(this, arguments);

            if (Q.isPromise(result)) {
                this.toggleFlag("running", true);
                result.fin(function() {
                    that.toggleFlag("running", false);
                });
            }

            return result;
        },

        // Toggle flag
        toggleFlag: function(flag, state) {
            var flags = this.get("flags", "").split(" ");

            if (state == null)  state = !_.contains(flags, flag);
            if (state) {
                flags.push(flag);
            } else {
                flags = _.without(flags, flag);
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
            if (!_.isArray(commands)) commands = [commands];
            var section = Command.section(commands, properties);
            this.menu.add(section);
            return this;
        },

        // Clear the menu
        clearMenu: function() {
            this.menu.reset([]);
            return this;
        },

        // Text comparaison score
        // for searching command, ordering, ...
        textScore: function(q) {
            var text = this.get("category")+" "+this.get("title")+" "+this.get("description");
            return string.score(text, q);
        }
    }, {
        // Collection of all commands
        all: null,

        // Register a command
        register: function(commandId, properties) {
            if (_.isObject(commandId)) {
                properties = commandId;
                commandId = properties.id;
            }

            if (!commandId) {
                commandId = _.uniqueId("command");
                return new Command({}, _.extend(properties, {
                    'id': commandId
                }));
            }
            
            if (!Command.all.get(commandId)) {
                logging.log("Register command", commandId);
                var command = new Command({}, _.extend(properties, {
                    'id': commandId
                }));

                // Bind keyboard shortcuts
                if (command.get("bindKeyboard")) {
                    _.each(command.get("shortcuts", []), function(shortcut) {
                        Keyboard.bind(shortcut, function(e) {
                            e.preventDefault();
                            this.run();
                        }, command);
                    });
                }

                Command.all.add(command);
                return command;
            } else {
                throw "Error command already registrated:"+commandId;
            }
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
        },

        // Run a command
        run: function(commandId) {
            var c = Command.all.get(commandId);
            if (!c) return false;
            return c.run.apply(c, Array.prototype.slice.call(arguments, 1));
        }
    });

    Command.all = new (hr.Collection.extend({
        Model: Command
    }));

    return Command;
});