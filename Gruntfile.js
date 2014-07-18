var path = require("path");
var Q = require("q");
var _ = require("lodash");
var fs = require("fs");
var wrench = require("wrench");
var pkg = require("./package.json");

module.exports = function (grunt) {
    // Path to the client src
    var srcPath = path.resolve(__dirname, "editor");
    var buildPath = path.resolve(__dirname, "build");

    // Load grunt modules
    grunt.loadNpmTasks('grunt-hr-builder');
    grunt.loadNpmTasks("grunt-bower-install-simple");
    grunt.loadNpmTasks('grunt-exec');;

    // Init GRUNT configuraton
    grunt.initConfig({
        "pkg": pkg,
        "bower-install-simple": {
            options: {
                color:       true,
                production:  false,
                directory:   "editor/vendors"
            }
        },
        "hr": {
            "app": {
                "source": path.resolve(__dirname, "node_modules/happyrhino"),

                // Base directory for the application
                "base": srcPath,

                // Application name
                "name": "Codebox",

                // Mode debug
                "debug": true,

                // Main entry point for application
                "main": "main",

                // Build output directory
                "build": buildPath,

                // Static files map
                "static": {
                    "fonts": path.resolve(srcPath, "resources/fonts")
                },

                // Stylesheet entry point
                "style": path.resolve(srcPath, "resources/stylesheets/main.less")
            }
        },
        "exec": {
            "clear_packages_build": {
                command: 'rm -f packages/**/pkg-build.js',
                stdout: false,
                stderr: false
            }
        }
    });

    // Build
    grunt.registerTask('link', 'Link a folder containing packages at packages folder', function() {
        var origin = grunt.option('origin');
        var prefix = grunt.option('prefix') || "package-";

        if (!origin) {
            grunt.log.error('Need --origin');
            return false;
        }

        origin = path.resolve(process.cwd(), origin);
        var filenames = fs.readdirSync(origin);

        _.each(filenames, function(filename) {
            if (filename.slice(0, prefix.length) != prefix) return;

            var from = path.resolve(origin, filename);
            var to = path.resolve(__dirname, "packages", filename.slice(prefix.length));

            grunt.log.writeln('Link', filename, 'to', to);
            if (fs.existsSync(to)) {
                wrench.rmdirSyncRecursive(to);
            }
            fs.linkSync(from, to);
        });
    });
    grunt.registerTask("prepare", 'Prepare client build', [
        "bower-install-simple"
    ]);
    grunt.registerTask('build', 'Build client code', [
        'hr:app',
        'exec:clear_packages_build'
    ]);

    grunt.registerTask('default', [
        'prepare',
        'build'
    ]);
};
