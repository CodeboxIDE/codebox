// Requires
var _ = require('lodash');

function setup(options, imports, register) {
    var deploy = imports.deploy;
    var shells = imports.shells;

    /*
    Can be improved with better support of command line tool appcfg.py:
    Documentation: https://developers.google.com/appengine/docs/python/tools/uploadinganapp
    */

    deploy.add({
        id: "appengine",
        name: "App Engine",

        settings: {
            url: {
                label: "Email",
                type: "text",
                help: "Google Account email to use for auth during application upload."
            }
        },

        actions: [
            {
                id: "update",
                name: "Update",
                action: function(config) {
                    var shellId = "appengine:update";

                    return shells.createShellCommand(
                        shellId,
                        ["appcfg.py", "--email="+config.email, "update", "./"]
                    ).then(function(shell) {
                        return {
                            'shellId': shellId
                        };
                    });
                }
            },
            {
                id: "logs",
                name: "Show Logs",
                action: function(config) {
                    var shellId = "appengine:logs";

                    return shells.createShellCommand(
                        shellId,
                        ["appcfg.py", "--email="+config.email, "request_logs", "./", "-"]
                    ).then(function(shell) {
                        return {
                            'shellId': shellId,
                            'title': "AppEngine Logs"
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
