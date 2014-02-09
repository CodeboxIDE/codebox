define(["views/dialog"], function(GitDialog) {
    var commands = codebox.require("core/commands/toolbar");
    var app = codebox.require("core/app");
    var dialogs = codebox.require("utils/dialogs");
    var menu = codebox.require("core/commands/menu");
    var box = codebox.require("core/box");
    var Command = codebox.require("models/command");
    var rpc = codebox.require("core/backends/rpc");
    var operations = codebox.require("core/operations");

    // Branches menu
    var branchesMenu = Command.register("git.branches", {
        'title': "Switch To Branch",
        'type': "menu",
        'offline': false
    });
    var updateBranchesMenu = function() {
        return rpc.execute("git/branches").then(function(branches) {
            branchesMenu.menu.reset(_.map(branches, function(branch) {
                return {
                    'title': branch.name,
                    'flags': branch.active ? "active" : "",
                    'action': function() {
                        var ref = branch.name;
                        return operations.start("git.checkout", function(op) {
                            return rpc.execute("git/checkout", {
                                'ref': ref
                            })
                        }, {
                            title: "Checkout '"+ref+"'"
                        }).then(updateBranchesMenu);
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
            'offline': false,
            'action': function() {
                return operations.start("git.sync", function(op) {
                    return rpc.execute("git/sync")
                }, {
                    title: "Pushing & Pulling"
                });
            }
        }
    ]).menuSection([
        {
            'id': "git.commit",
            'title': "Commit",
            'shortcuts': ["mod+shift+C"],
            'offline': false,
            'action': function() {
                dialogs.open(GitDialog);
            }
        }
    ]).menuSection([
        {
            'id': "git.push",
            'title': "Push",
            'shortcuts': ["mod+P"],
            'offline': false,
            'action': function() {
                return operations.start("git.push", function(op) {
                    return rpc.execute("git/push")
                }, {
                    title: "Pushing"
                });
            }
        },
        {
            'id': "git.pull",
            'title': "Pull",
            'shortcuts': ["shift+mod+P"],
            'offline': false,
            'action': function() {
                return operations.start("git.pull", function(op) {
                    return rpc.execute("git/pull")
                }, {
                    title: "Pulling"
                });
            }
        }
    ]).menuSection([
        branchesMenu,
        {
            'id': "git.branches.refresh",
            'title': "Refresh branches",
            'offline': false,
            'action': updateBranchesMenu
        }
    ]).menuSection([
        {
            'id': "git.branch.create",
            'title': "Create a branch",
            'offline': false,
            'action': function() {
                dialogs.prompt("Create a branch", "Enter the name for the new branch:").then(function(name) {
                    if (!name) return;
                    operations.start("git.branch.create", function(op) {
                        return rpc.execute("git/branch_create", {
                            'name': name
                        })
                    }, {
                        title: "Creating branch '"+name+"'"
                    }).then(updateBranchesMenu);
                });
            }
        },
        {
            'id': "git.branch.delete",
            'title': "Delete a branch",
            'offline': false,
            'action': function() {
                dialogs.prompt("Delete a branch", "Enter the name of the branch you want to delete:").then(function(name) {
                    if (!name) return;
                    operations.start("git.branch.delete", function(op) {
                        return rpc.execute("git/branch_delete", {
                            'name': name
                        })
                    }, {
                        title: "Deleting branch '"+name+"'"
                    }).then(updateBranchesMenu);
                });
            }
        }
    ]);

    updateBranchesMenu();
});

