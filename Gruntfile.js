module.exports = function (grunt) {
    var fs = require('fs');
    var path = require("path");
    var pkg = require("./package.json");
    var _ = require('lodash');

    // Path to the client src
    var clientPath = path.resolve(__dirname, "client");

    // Constants
    var NW_VERSION = "0.8.4";

    // Load grunt modules
    grunt.loadNpmTasks('hr.js');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Init GRUNT configuraton
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        hr: {
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
                    "images": path.resolve(clientPath, "resources", "images"),
                    "fonts": path.resolve(clientPath, "resources", "fonts")
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
                            'vendors/bootstrap/transition',
                            'vendors/taphold'
                        ]
                    },
                    'vendors/socket.io': {
                        exports: 'io'
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
                    'version': pkg.version,
                    'debug': process.env.CLIENT_DEBUG != null
                },
                'options': {

                }
            }
        },
        exec: {
            publish: {
                command: "npm publish",
                cwd: '.tmp/',
                stdout: true,
                stderr: true
            },
            build_files_editor: {
                command: "npm install",
                cwd: './addons/cb.files.editor/',
                stdout: true,
                stderr: true
            },
            clean_addons: {
                command: "rm -rf */**/addon-built.js ./addons/**/node_modules",
                cwd: '.',
                stdout: true,
                stderr: true
            },
            clean_addons_tmp: {
                command: "rm -rf */**/addon-built.js",
                cwd: '.tmp/',
                stdout: true,
                stderr: true
            }
        },
        copy: {
            // Copy most files over
            tmp: {
                expand: true,
                dot: false,
                cwd: './',
                dest: '.tmp/',
                src: [
                    // Most files except the ones below
                    "./**",

                    // Ignore gitignore
                    "!.gitignore",

                    // Ignore dev related things
                    "!./tmp/**",
                    "!./.git/**",
                    "!./.addons/**",
                    "!./appBuilds/**",

                    // grunt.file.copy duplicates symbolic and hard links
                    // so we need to copy it with the shell
                    "!./extras/**",

                    // Only take "./client/build"
                    "!./client/**",
                    "./client/build/**",

                    // Ignore some build time only modules
                    "./node_modules/.bin/**",
                    "!./node_modules/grunt/**",
                    "!./node_modules/grunt-*/**",
                    "!./node_modules/hr.js/**",

                    // Exclude test directories from node modules
                    "!./node_modules/**/test/**",
                ],

                // Preserve permissions
                options: {
                    mode: true
                }
            }
        },
        compress: {
            tmp: {
                options: {
                  mode: 'gzip',
                  pretty: true
                },
                expand: true,
                src: [
                    // Codebox Built addons
                    '.tmp/addons/*/addon-built.js',

                    // Ace source
                    '.tmp/addons/cb.files.editor/ace/**',

                    // HR.js application
                    '.tmp/client/build/static/application.{js,css}'
                ],
                filter: function(src) {
                    // Compressable file formats
                    if(!_.contains([
                        'js',
                        'css',
                        'svg',
                        'less',
                        'html',
                        'snippets'
                    ],
                    path.extname(src).slice(1)
                    )) return false;
                    try {
                        // We don't want to gzip tiny files
                        // Skip files < 10kb
                        return fs.statSync(src).size > 10*1024;
                    } catch(err) {}
                    return false;
                }
            }
        },
        clean: {
            tmp: ['.tmp/']
        },
        buildAddons: {
            tmp: {
                addonsFolder: ".tmp/addons/"
            },
            dev: {
                addonsFolder: "./addons/",
                force: false
            }
        }
    });

    // Load in any and all tasks in the `tasks` folder
    grunt.loadTasks('tasks');

    // Rebuild all addons
    grunt.registerTask('rebuildAddons', [
        'exec:clean_addons',
        'buildAddons:dev'
    ]);

    // Build
    grunt.registerTask('build', [
        'hr',
        'exec:build_files_editor',
        'buildAddons:dev'
    ]);

    // Build tmp directory
    grunt.registerTask('tmp', [
        'build',
        'clean:tmp',
        'copy:tmp',
        'exec:clean_addons_tmp',
        'buildAddons:tmp',
        'compress:tmp'
    ]);

    // Publish to NPM
    grunt.registerTask('publish', [
        'tmp',
        'exec:publish',
        'clean:tmp'
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
