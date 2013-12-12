define(["views/dialog"], function(GitDialog) {
    var commands = codebox.require("core/commands");
    var app = codebox.require("core/app");
    var dialogs = codebox.require("utils/dialogs");
    var menu = codebox.require("core/menu");

    // Add menu
    menu.register("git", {
        title: "Git"
    }, [
        {
            'type': "action",
            'text': "Commit",
            'action': function() {
                dialogs.open(GitDialog);
            }
        }
    ]);
});

