define(["views/dialog"], function(HelpDialog) {
    var commands = codebox.require("core/commands");
    var app = codebox.require("core/app");
    var dialogs = codebox.require("utils/dialogs");

    // Add opening command
    commands.register("addons.client", {
        title: "Help",
        icon: "question",
        shortcuts: [
            '?'
        ]
    }, function() {
        dialogs.open(HelpDialog);
    });
});

