// Requires
var _ = require('underscore');
var path = require("path");
var fs = require("fs");
var Q = require("q");

var api = require("./api");

function setup(options, imports, register) {
    var deploy = imports.deploy;

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
                label: "Key",
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
                        console.log("add api key", config.key, content);
                        return api.method(config.key, "POST", "account/keys", {
                            body: {
                                'public_key': content
                            }
                        });
                    })
                    .then(function() {
                        return "SSH key added to Heroku";
                    });
                }
            },
            {
                id: "push",
                name: "Push",
                action: function() {
                    
                }
            }
        ]
    });

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
