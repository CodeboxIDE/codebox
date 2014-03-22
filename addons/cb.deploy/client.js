define([], function() {
    var Q = codebox.require("hr/promise");
    var _ = codebox.require("hr/utils");
    var dialogs = codebox.require("utils/dialogs");
    var box = codebox.require("core/box");
    var rpc = codebox.require("core/backends/rpc");
    var Command = codebox.require("models/command");
    var menu = codebox.require("core/commands/menu");
    var user = codebox.require("core/user");

    var CryptoJS = codebox.require("vendors/crypto");

    // Settings for deployment
    var settings = user.settings("deploymentSolutions");

    // Return list of solutions
    var getSolutionTypes = function() {
        return rpc.execute("deploy/solutions");
    };

    // Return infos for a specific solution type
    var getSolutionType = function(id) {
        return getSolutionTypes().then(function(_types) {
            var s = _.find(_types, function(_type) {
                return _type.id == id;
            });
            if (!s) throw "Invalid solution type";
            return s;
        });
    };

    // Id for a solution name
    var solutionId = function(name) {
        return CryptoJS.MD5(name).toString();
    };

    // Add a solution
    var addSolution = function(name, solution) {
        var solutions = settings.get("solutions", {});
        var id = solutionId(name);
        if (solutions[id]) return Q.reject("Solution already exists");
        solutions[id] = {
            'name': name,
            'type': solution,
            'settings': {}
        };
        settings.set("solutions", solutions);
        return settings.save().then(function() {
            return solutions[id];
        });
    };

    // Remove a solution
    var removeSolution = function(id) {
        var solutions = settings.get("solutions", {});
        if (!solutions[id]) return Q.reject("Invalid solution");
        delete solutions[id];
        settings.set("solutions", solutions);
        return settings.save();
    };

    // Run a solution
    var runSolution = function(solution, actionId) {
        if (_.isString(solution)) solution = getSolution(solution);

        return rpc.execute("deploy/run", {
            'solution': solution.type,
            'action': actionId,
            'config': solution.settings
        })
        .then(function(data) {
            // Handle shells
            if (data.shellId) {
                box.openTerminal(data.shellId, {
                    id: "deploy."+solutionId(solution.name)+"."+actionId,
                    title: data.title || "Deployment to "+solution.name+" ("+actionId+")",
                    icons: {
                        'default': "fa-cloud-upload",
                    }
                });
            }
            // Handle message
            else if (data.message) {
                dialogs.alert("Deployment to "+solution.name+" ("+actionId+")", data.message);
            }
        }, function(err) {
            dialogs.alert("Error with "+solution.name, err.message || err);
        });
    };

    // Return solution informations by its id
    var getSolution = function(id) {
        var solutions = settings.get("solutions", {});
        return solutions[id];
    };

    var setSolutionSettings = function(id, _settings) {
        var solutions = settings.get("solutions", {});
        solutions[id].settings = _settings;
        settings.set("solutions", solutions);
    };

    // Open settings for a solution
    var openSettings = function(id) {
        var solution = getSolution(id);
        return getSolutionType(solution.type).then(function(_type) {
            return dialogs.fields("Configuration for "+_.escape(solution.name), _type.settings, solution.settings);
        })
        .then(function(newSettings) {
            setSolutionSettings(id, newSettings);
            return settings.save();
        });
    };

    // Command to add a new deployment solution
    var addCommand = Command.register("deploy.solutions.add", {
        category: "Deployment",
        title: "Add Solution",
        description: "Add a solution",
        offline: false,
        action: function(page) {
            getSolutionTypes().then(function(solutionTypes) {
                return dialogs.fields("Add Deployment Solution", {
                    name: {
                        type: "text",
                        label: "Label"
                    },
                    solution: {
                        type: "select",
                        label: "Type",
                        options: _.object(_.map(solutionTypes, function(solution) {
                            return [
                                solution.id,
                                solution.name
                            ];
                        }))
                    }
                });
            })
            .then(function(data) {
                if (!data.name || !data.solution) throw "Need 'name' and 'solution'";
                return addSolution(data.name, data.solution);
            })
            .then(function(solution) {
                return openSettings(solutionId(solution.name));
            });
        }
    });

    // Command to remove a solution
    var removeCommand = Command.register("deploy.solutions.remove", {
        category: "Deployment",
        title: "Remove Solution",
        description: "Remove a solution",
        offline: false,
        action: function() {
            dialogs.select("Remove Deployment Solution",
            "Select a solution, this solution and its configuration will be removed from your settings.",
            _.chain(settings.get("solutions", {}))
            .map(function(solution, id) {
                return [id, solution.name]
            })
            .object()
            .value()).then(removeSolution);
        }
    });

    // Deploy Menu
    var deployMenu = menu.register("deploy", {
        title: "Deploy",
        position: 90,
        offline: false
    });

    // Update list of solutions
    var updateSolutions = function() {
        return getSolutionTypes().then(function(_types) {
            var solutions = settings.get("solutions", {});

            deployMenu.clearMenu();

            // Add command to create new solutions
            deployMenu.menuSection(_.compact([
                addCommand,
                _.size(solutions) > 0 ? removeCommand : null
            ]));

            // Add all solutions
            if (_.size(solutions) == 0) return;
            deployMenu.menuSection(
                _.chain(solutions)
                .map(function(solution, solutionId) {
                    var solutionType = _.find(_types, function(_type) {
                        return _type.id == solution.type;
                    });
                    if (!solutionType) return null;

                    var command = Command.register({
                        title: solution.name,
                        type: "menu",
                        offline: false,
                        action: function() {
                            openSettings(solutionId(solution.name));
                        }
                    });

                    command.menuSection(
                        _.map(solutionType.actions, function(action) {
                            return {
                                title: action.name,
                                offline: false,
                                action: function() {
                                    return runSolution(solution, action.id);
                                }
                            };
                        })
                    );

                    command.menuSection([
                        {
                            title: "Configure",
                            offline: false,
                            action: function() {
                                openSettings(solutionId);
                            }
                        }
                    ]);

                    return command;
                })
                .compact()
                .value()
            );
        });
        
    };

    updateSolutions();
    settings.change(updateSolutions);
});