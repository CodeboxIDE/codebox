define(["views/dialog"], function(GitDialog) {
    var commands = codebox.require("core/commands");
    var app = codebox.require("core/app");
    var dialogs = codebox.require("utils/dialogs");
    var menu = codebox.require("core/menu");
    var box = codebox.require("core/box");

    // Add menu
    menu.register("git", {
        title: "Repository"
    }).menuSection([
        {
            'id': "git.sync",
            'title': "Synchronize",
            'shortcuts': ["mod+S"],
            'action': function() {
                box.sync();
            }
        }
    ]).menuSection([
        {
            'id': "git.commit",
            'title': "Commit",
            'shortcuts': ["mod+shift+C"],
            'action': function() {
                dialogs.open(GitDialog);
            }
        }
    ]).menuSection([
        {
            'id': "git.push",
            'title': "Push",
            'shortcuts': ["mod+P"],
            'action': function() {
                box.gitPush();
            }
        },
        {
            'id': "git.pull",
            'title': "Pull",
            'shortcuts': ["shift+mod+P"],
            'action': function() {
                box.gitPull();
            }
        }
    ])
});

