define([
    "settings",
    "views/panel"
], function(settings, PanelOutlineView) {
    var commands = codebox.require("core/commands/toolbar");
    var app = codebox.require("core/app");
    var panels = codebox.require("core/panels");
    var menu = codebox.require("core/commands/menu");
    var box = codebox.require("core/box");

    // Add outline panel
    var panel = panels.register("outline", PanelOutlineView, {
        title: "Outline"
    });
    
    // Add command to open outline panel
    panel.connectCommand(commands.register("outline.open", {
        category: "Panels",
        title: "Outline",
        description: "Open Outline Panel",
        icons: {
            'default': "code",
        },
        position: 2,
        shortcuts: []
    }));

    // Open panel during startup
    if (settings.user.get("startup")) panel.open();
});