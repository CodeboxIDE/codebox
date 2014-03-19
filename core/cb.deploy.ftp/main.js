// Requires
var _ = require('lodash');
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
                type: "text",
                help: "URL of the FTP server"
            },
            username: {
                label: "Username",
                type: "text",
                help: "Username to login with during the FTP connection"
            },
            password: {
                label: "Password",
                type: "password",
                help: "(optional) If empty, will be prompted during operation and not stored"
            },
            localBase: {
                label: "Base Local Directory",
                type: "text",
                help: "(optional) Leave empty to use workspace root."
            },
            remoteBase: {
                label: "Base Remote Directory",
                type: "text",
                help: "(optional) Leave empty to use FTP user root directory."
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
                        throw "Invalid local path:"+localPath;
                    }

                    return shells.createShellCommand(
                        shellId,
                        ['/bin/bash', scriptUpload, config.host, config.remoteBase || "/", localPath, config.username, config.password]
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
