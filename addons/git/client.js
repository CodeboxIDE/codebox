define(["views/dialog"], function(GitDialog) {
    var commands = codebox.require("core/commands");
    var app = codebox.require("core/app");
    var dialogs = codebox.require("utils/dialogs");

    // Add opening command
    commands.register("addons.git", {
        title: "GIT",
        icon: "code-fork"
    }, function() {
        dialogs.open(GitDialog);
    });
});

