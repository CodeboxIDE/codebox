define([], function() {
    var _ = codebox.require("underscore");
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
        return rpc.execute("project/deployment/solutions");
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
        if (solutions[id]) return null;
        solutions[id] = {
            'name': name,
            'type': solution,
            'settings': {}
        };
        settings.set("solutions", solutions);
        updateSolutions();
        return solutions[id];
    };

    // Remove a solution
    var removeSolution = function(id) {
        var solutions = settings.get("solutions", {});
        if (!solutions[id]) return null;
        delete solutions[id];
        settings.set("solutions", solutions);
        updateSolutions();
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
            return dialogs.fields("Configuration for "+solution.name, _type.settings, solution.settings);
        })
        .then(function(newSettings) {
            setSolutionSettings(id, newSettings);
            return settings.save();
        });
    };

    // Command to add a new deployment solution
    var addCommand = Command.register("deploy.configure", {
        title: "Add Solution",
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
                var solution = addSolution(data.name, data.solution);
                if (!solution) throw "Cannot add this solution";
                return openSettings(solutionId(solution.name));
            });
        }
    });

    // Deploy Menu
    var deployMenu = menu.register("deploy", {
        title: "Deploy",
        position: 90
    });

    // Update list of solutions
    var updateSolutions = function() {
        return getSolutionTypes().then(function(_types) {
            deployMenu.clearMenu();

            // Add command to create new solutions
            deployMenu.menuSection([
                addCommand
            ]);

            // Add all solutions
            var solutions = settings.get("solutions", {});
            deployMenu.menuSection(
                _.chain(solutions)
                .map(function(solution) {
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
                                    alert("do "+action.id);
                                }
                            };
                        })
                    );

                    command.menuSection([
                        {
                            title: "Configure",
                            offline: false,
                            action: function() {
                                openSettings(solutionId(solution.name));
                            }
                        },
                        {
                            title: "Remove",
                            offline: false,
                            action: function() {
                                removeSolution(solutionId(solution.name));
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
});