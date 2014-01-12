module.exports = function (grunt) {
    var path = require("path");
    var pkg = require("./package.json");

    // Path to the client src
    var clientPath = path.resolve(__dirname, "client");

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
                    'version': pkg.version,
                    'debug': process.env.CLIENT_DEBUG != null
                },
                'options': {
                    
                }
            }
        },
        nodewebkit: {
        options: {
            build_dir: './appBuilds',
            mac: true,
            win: false,
            linux32: false,
            linux64: false,
            mac_icns: "./bin/dashboard/icons/mac.icns",
            credits: "./bin/dashboard/credits.html"
        },
        src: ["./*"]
}
    });

    // Build
    grunt.loadNpmTasks('hr.js');
    grunt.registerTask('build', [
        'hr'
    ]);

    // Desktop app generation
    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.registerTask('buildApps', [
        'build',
        'nodewebkit'
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