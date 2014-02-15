// Requires
var _ = require('underscore');
var path = require("path");

function setup(options, imports, register) {
    var deploy = imports.deploy;
    var shells = imports.shells;
    var workspace = imports.workspace;

    var scriptUpload = path.resolve(__dirname, "upload.sh");

    deploy.add({
        id: "ftp",
        name: "FTP",

        settings: {
            host: {
                label: "Host",
                type: "text"
            },
            username: {
                label: "Username",
                type: "text"
            },
            host: {
                label: "Host",
                type: "text"
            },
            localBase: {
                label: "Base Local Directory",
                type: "text",
                help: "Leave empty to use workspace root."
            },
            remoteBase: {
                label: "Base Remote Directory",
                type: "text",
                help: "Leave empty to use FTP user root directory."
            }
        },

        actions: [
            {
                id: "upload",
                name: "Upload",
                action: function(config) {
                    var shellId = "ftp:upload";

                    var localPath = path.resolve(workspace.root, config.localBase || "./");
                    if (localPath.indexOf(workspace.root) !== 0) {
                        throw "Invalid local path";
                    }

                    return shells.createShellCommand(
                        shellId,
                        [scriptUpload, config.host, config.remoteBase || "/", config.username, localPath]
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
