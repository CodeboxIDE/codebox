define(["views/dialog"], function(GitDialog) {
    var commands = codebox.require("core/commands/toolbar");
    var app = codebox.require("core/app");
    var dialogs = codebox.require("utils/dialogs");
    var menu = codebox.require("core/commands/menu");
    var box = codebox.require("core/box");
    var Command = codebox.require("models/command");
    var rpc = codebox.require("core/backends/rpc");
    var operations = codebox.require("core/operations");

    // Check git status
    var updateStatus = function() {
        return rpc.execute("git/status")
        .then(function() {
            updateMenu(true);
            return updateBranchesMenu();
        }, function(err) {
            updateMenu(false);
        })
    };

    // Branches menu
    var branchesMenu = Command.register("git.branches", {
        'title': "Switch To Branch",
        'type': "menu",
        'offline': false
    });
    var updateBranchesMenu = function() {
        return rpc.execute("git/branches")
        .then(function(branches) {
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
    var gitMenu = menu.register("git", {
        title: "Repository"
    });

    var updateMenu = function(state) {
        // Clear menu
        gitMenu.clearMenu();

        // Invalid repository
        if (!state) {
            gitMenu.menuSection([
                {
                    'title': "Invalid GIT repository",
                    'type': "label",
                    'iconMenu': "warning"
                },
                {
                    'id': "git.init",
                    'title': "Initialize Repository",
                    'offline': false,
                    'action': function() {
                        return operations.start("git.init", function(op) {
                            return rpc.execute("git/init")
                        }, {
                            title: "Initializing GIT repository"
                        });
                    }
                },
                {
                    'id': "git.clone",
                    'title': "Clone Repository",
                    'offline': false,
                    'action': function() {
                        return operations.start("git.clone", function(op) {
                            return rpc.execute("git/clone")
                        }, {
                            title: "Cloning GIT repository"
                        });
                    }
                }
            ]);
        } else {
            gitMenu.menuSection([
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
                        dialogs.open(GitDialog)
                        .then(updateStatus);
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
                    'action': updateBranchesMenu,
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
                                return rpc.execute("git/branch/create", {
                                    'name': name
                                })
                            }, {
                                title: "Creating branch '"+name+"'"
                            });
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
                                return rpc.execute("git/branch/delete", {
                                    'name': name
                                })
                            }, {
                                title: "Deleting branch '"+name+"'"
                            }).then(updateBranchesMenu);
                        });
                    }
                }
            ]);
        }
    };

    updateStatus();
});

