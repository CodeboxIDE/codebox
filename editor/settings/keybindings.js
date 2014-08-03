define([
    "core/commands",
    "core/settings"
], function(commands, settings) {
    /*
     *  The key bindings configuration allow the user to
     *  change the default keyboard shortcuts for specific commands
     */

    var keyBindings = settings.schema("keybindings", {
        title: "Key bindings",
        type: "object",
        properties: {
            commands: {
                type: "array",
                items: {
                    "command": {
                        type: "string"
                    },
                    "keys": {
                        type: "array"
                    }
                }
            }
        }
    });

    // Update a command
    var updateCommand = function(cmd) {
        var bindings = keyBindings.data.get("commands");
        var bind = _.find(bindings, { 'command': cmd.id });

        if (!bind) return;
        cmd.set("shortcuts", bind.keys);
    };

    // Update all commands
    var updateAll = function() {
        commands.each(updateCommand);
    };

    // Update commands everytime settings change and adapt new commands
    keyBindings.data.on("change", updateAll);
    commands.on("add", updateCommand);
    commands.on("reset", updateAll);

    updateAll

    return keyBindings;
});