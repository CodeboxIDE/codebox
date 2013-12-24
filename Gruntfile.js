module.exports = function (grunt) {
    var path = require("path");
    var pkg = require("./package.json");

    // Path to the client src
    var clientPath = path.resolve(__dirname, "src/client");

    // Init GRUNT configuraton
    grunt.initConfig({
        'pkg': grunt.file.readJSON('package.json'),
        'hr': {
            build: {
                // Base directory for the application
                "base": clientPath,

                // Application name
                "name": "Codebox",

                // Mode debug
                "debug": process.env.CLIENT_DEBUG != null,

                // Main entry point for application
                "main": "main",
                "index": grunt.file.read(path.resolve(clientPath, "index.html")),

                // Build output directory
                "build": path.resolve(clientPath, "build"),

                // Static files mappage
                "static": {
                    "templates": path.resolve(clientPath, "resources", "templates"),
                    "images": path.resolve(clientPath, "resources", "images"),
                    "fonts": path.resolve(clientPath, "resources", "fonts"),
                    "require-tools": path.resolve(clientPath, "resources", "require-tools")
                },

                // Stylesheet entry point
                "style": path.resolve(clientPath, "resources/stylesheets/main.less"),

                // Modules paths
                'paths': {
                    'moment': 'vendors/moment'
                },
                "shim": {
                    'resources/resources': {
                        deps: [
                            'vendors/bootstrap/carousel',
                            'vendors/bootstrap/dropdown',
                            'vendors/bootstrap/button',
                            'vendors/bootstrap/modal',
                            'vendors/bootstrap/affix',
                            'vendors/bootstrap/alert',
                            'vendors/bootstrap/collapse',
                            'vendors/bootstrap/tooltip',
                            'vendors/bootstrap/popover',
                            'vendors/bootstrap/scrollspy',
                            'vendors/bootstrap/tab',
                            'vendors/bootstrap/transition'
                        ]
                    },
                    'vendors/socket.io': {
                        exports: 'io'
                    },
                    'vendors/socket.io-stream': {
                        exports: 'ss'
                    },
                    'vendors/crypto': {
                        exports: 'CryptoJS'
                    },
                    'vendors/diff_match_patch': {
                        exports: 'diff_match_patch'
                    },
                    'vendors/mousetrap': {
                        exports: 'Mousetrap'
                    },
                    'vendors/filer': {
                        exports: 'Filer',
                        deps: [
                            'vendors/idb.filesystem'
                        ]
                    }
                },
                'args': {
                    'version': pkg.version
                },
                'options': {
                    
                }
            }
        },
        'run': {
            'options': {
                'modules': [
                    "./config",
                    "./logger",
                    "./analytics",
                    "./payment",
                    "./database",
                    "./dynobox",
                    "./email",
                    "./model.user",
                    "./model.event",
                    "./model.addon",
                    "./model.box",
                    "./web.offline",
                    "./web.api",
                    "./web.api.auth",
                    "./web.api.box",
                    "./web.api.addon",
                    "./web.oauth",
                    "./web.oauth.github",
                    "./web.oauth.bitbucket",
                    "./web.oauth.assembla",
                    "./web.oauth.heroku",
                    "./web.main"
                ]
            }
        }
    });

    // Build
    grunt.loadNpmTasks('hr.js');
    grunt.registerTask('build', [
        'hr'
    ]);

    // Run
    grunt.registerTask('run', function() {
        var done = this.async();
        var options = this.options({});

        grunt.util.spawn({
            cmd: "node",
            opts: {
                cwd: path.resolve(__dirname),
                stdio: 'inherit'
            },
            args: ["./bin/codebox.js", "run"]
        }, done);
    });

    grunt.registerTask('default', [
        'build',
        'run'
    ]);
};