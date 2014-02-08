define([], function() {
    var _ = codebox.require("underscore");
    var box = codebox.require("core/box");
    var rpc = codebox.require("core/backends/rpc");
    var Command = codebox.require("models/command");

    // HTTP Ports
    var samplesMenu = new Command({}, {
        'title': "Sample Projects",
        'type': "menu",
        'offline': false
    });

    // Update running ports list
    var updateSamples = function() {
        return rpc.execute("project/supported").then(function(projectTypes) {
            samplesMenu.menu.reset(
                _.chain(projectTypes)
                .map(function(projectType) {
                    if (!projectType.sample) return null;

                    return {
                        'title': projectType.name,
                        'action': function() {
                            return rpc.execute("project/useSample", {
                                'sample': projectType.id
                            });
                        }
                    };
                })
                .compact()
                .value()
            );

            return projectTypes;
        });
    };

    return {
        'command': samplesMenu,
        'update': updateSamples
    }
});