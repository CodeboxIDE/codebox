define([
    "core/settings"
], function(settings) {

    return settings.schema("keybindings", {
        title: "Key bindings",
        properties: {
            commands: {
                type: "object"
            }
        }
    });
});