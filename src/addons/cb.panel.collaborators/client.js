define([
    "views/panel"
], function(PanelCollaboratorsView) {
    var $ = codebox.require("jQuery");
    var collaborators = codebox.require("core/collaborators");
    var search = codebox.require("core/search");
    var box = codebox.require("core/box");
    var user = codebox.require("core/user");
    var commands = codebox.require("core/commands");
    var panels = codebox.require("core/panels");

    // Add search panel
    var panel = panels.register("collaborators", PanelCollaboratorsView);
    
    // Add opening command
    var command = commands.register("collaborators.open", {
        title: "Collaborators",
        icon: "comments-o",
        position: 5,
        shortcuts: [
            "c"
        ]
    });
    panel.connectCommand(command);
});