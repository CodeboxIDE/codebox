define(["views/dialog"], function(GitDialog) {
    var commands = codebox.require("core/commands/toolbar");
    var app = codebox.require("core/app");
    var dialogs = codebox.require("utils/dialogs");
    var menu = codebox.require("core/commands/menu");
    var box = codebox.require("core/box");
    var Command = codebox.require("models/command");

    // Branches menu
    var branchesMenu = Command.register("git.branches", {
        'title': "Switch To Branch",
        'type': "menu"
    });
    var updateBranchesMenu = function() {
        box.gitBranches().then(function(branches) {
            branchesMenu.menu.reset(_.map(branches, function(branch) {
                return {
                    'title': branch.name,
                    'flags': branch.active ? "active" : "",
                    'action': function() {
                        box.gitCheckout(branch.name).then(updateBranchesMenu);
                    }
                }
            }));
        });
    };

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
    ]).menuSection([
        branchesMenu,
        {
            'id': "git.branches.refresh",
            'title': "Refresh branches",
            'action': updateBranchesMenu
        }
    ]).menuSection([
        {
            'id': "git.branch.create",
            'title': "Create a branch",
            'action': function() {
                dialogs.prompt("Create a branch", "Enter the name for the new branch:").then(function(name) {
                    if (!name) return;
                    box.gitBranchCreate(name).then(updateBranchesMenu);
                });
            }
        },
        {
            'id': "git.branch.delete",
            'title': "Delete a branch",
            'action': function() {
                dialogs.prompt("Delete a branch", "Enter the name of the branch you want to delete:").then(function(name) {
                    if (!name) return;
                    box.gitBranchDelete(name).then(updateBranchesMenu);
                });
            }
        }
    ]);

    updateBranchesMenu();
});

