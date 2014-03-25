define(["views/dialog"], function(GitDialog) {
    var Q = codebox.require("hr/promise");
    var commands = codebox.require("core/commands/toolbar");
    var app = codebox.require("core/app");
    var box = codebox.require("core/box");
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
            return updateBranchesMenu(false);
        }, function(err) {
            updateMenu(false);
        })
    };

    // Branches menu
    var branchesMenu = Command.register({
        'title': "Switch To Branch",
        'type': "menu",
        'offline': false
    });
    var updateBranchesMenu = function(doUpdateStatus) {
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
                        })
                        .then(updateBranchesMenu);
                    }
                }
            }));
        }, function(err) {
            if (doUpdateStatus !== false) updateStatus();
            return Q.reject(err);
        });
    };

    // Handle http auth
    var handleHttpAuth = function(method) {
        return Q(method())
        .fail(function(err) {
            if (err.code == 401) {
                // Fields for https auth
                var fields = {
                    username: {
                        type: "text",
                        label: "Username"
                    },
                    password: {
                        type: "password",
                        label: "Password"
                    }
                };

                // Passphrase for ssh
                if (err.message.toLowerCase().indexOf("authentication") < 0) {
                    fields = {
                        passphrase: {
                            type: "text",
                            label: "Passphrase"
                        }
                    };
                }

                return dialogs.fields("Need authentication:", fields)
                .then(method);
            } else {
                return Q.reject(err);
            }
        })
    };

    // Add menu
    var gitMenu = menu.register("git", {
        title: "Repository",
        offline: false
    });

    var updateMenu = function(state) {
        // Clear menu
        gitMenu.clearMenu();

        // Invalid repository
        if (!state) {
            gitMenu.menuSection([
                {
                    'title': "No GIT Repository detected",
                    'type': "label",
                    'icons': {
                        'menu': "warning",
                    }
                },
                {
                    'title': "Initialize Local Repository",
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
                    'title': "Clone Remote Repository",
                    'offline': false,
                    'action': function() {
                        return operations.start("git.clone", function(op) {
                            return dialogs.prompt("Clone Remote Repository", "Remote repository URI:")
                            .then(function(url) {
                                if (!url) return;
                                return handleHttpAuth(function(creds) {
                                    return rpc.execute("git/clone", {
                                        'url': url,
                                        'auth': creds || {}
                                    });
                                });
                            });
                        }, {
                            title: "Cloning GIT repository"
                        });
                    }
                }
            ]);
        } else {
            gitMenu.menuSection([
                {
                    'title': "Commit",
                    'shortcuts': ["mod+shift+C"],
                    'offline': false,
                    'action': function() {
                        dialogs.open(GitDialog);
                    }
                }
            ]).menuSection([
                {
                    'title': "Synchronize",
                    'shortcuts': ["mod+S"],
                    'offline': false,
                    'action': function() {
                        return operations.start("git.sync", function(op) {
                            return handleHttpAuth(function(creds) {
                                return rpc.execute("git/sync", {
                                    'auth': creds || {}
                                });
                            });
                        }, {
                            title: "Pushing & Pulling"
                        });
                    }
                },
                {
                    'title': "Push",
                    'shortcuts': ["mod+P"],
                    'offline': false,
                    'action': function() {
                        return operations.start("git.push", function(op) {
                            return handleHttpAuth(function(creds) {
                                return rpc.execute("git/push", {
                                    'auth': creds || {}
                                });
                            });
                        }, {
                            title: "Pushing"
                        });
                    }
                },
                {
                    'title': "Pull",
                    'shortcuts': ["shift+mod+P"],
                    'offline': false,
                    'action': function() {
                        return operations.start("git.pull", function(op) {
                            return handleHttpAuth(function(creds) {
                                return rpc.execute("git/pull", {
                                    'auth': creds || {}
                                });
                            });
                        }, {
                            title: "Pulling"
                        });
                    }
                }
            ]).menuSection([
                branchesMenu,
                {
                    'title': "Refresh branches",
                    'offline': false,
                    'action': updateBranchesMenu,
                }
            ]).menuSection([
                {
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

    box.on("box:git", function() {
        updateStatus();
    });
    updateStatus();
});

