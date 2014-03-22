// Requires
var _ = require('lodash');
var path = require("path");
var fs = require("fs");
var Q = require("q");

var api = require("./api");

function setup(options, imports, register) {
    var deploy = imports.deploy;
    var shells = imports.shells;

    deploy.add({
        id: "heroku",
        name: "Heroku",

        settings: {
            name: {
                label: "Name",
                type: "text",
                help: "Application name from your heroku account."
            },
            key: {
                label: "API Key",
                type: "text",
                help: "You can find your API key in your settings Heroku."
            }
        },

        actions: [
            {
                id: "push:key",
                name: "Deploy Public Key",
                action: function(config) {
                    if (!config.key) throw "Need Heroku API key to deploy your SSH Public Key";

                    var publickey_file = path.join(process.env.HOME, '.ssh/id_rsa.pub');
                    return Q.nfcall(fs.readFile, publickey_file, 'utf8')
                    .then(function(content) {
                        return api.method(config.key, "POST", "account/keys", {
                            body: {
                                'public_key': content
                            }
                        })
                        .then(function() {
                            return "SSH key ("+content.slice(0, 20)+"......"+content.slice(-4)+") added to your Heroku account.";
                        });
                    });
                }
            },
            {
                id: "push",
                name: "Push",
                action: function(config) {
                    var shellId = "heroku:deploy";
                    var url = "git@heroku.com:"+config.name+".git";

                    return shells.createShellCommand(
                        shellId,
                        ["git", "push", url, "master"]
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
