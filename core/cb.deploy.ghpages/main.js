// Requires
var _ = require('lodash');

function setup(options, imports, register) {
    var deploy = imports.deploy;
    var shells = imports.shells;

    deploy.add({
        id: "ghpages",
        name: "GitHub Pages",

        settings: {
            url: {
                label: "GitHub GIT Url",
                type: "text",
                default: "origin",
                help: "GIT url to the GitHub repository, or a remote name ('origin' will use the default repository url)."
            }
        },

        actions: [
            {
                id: "push",
                name: "Push",
                action: function(config) {
                    var shellId = "ghpages:push";

                    return shells.createShellCommand(
                        shellId,
                        ["git", "push", config.url || "origin", "gh-pages"]
                    ).then(function(shell) {
                        return {
                            'shellId': shellId
                        };
                    });
                }
            }
        ]
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
