var path = require("path");
var Q = require("q");
var _ = require("lodash");
var fs = require("fs");
var wrench = require("wrench");
var pkg = require("./package.json");

module.exports = function (grunt) {
    // Path to the client src
    var srcPath = path.resolve(__dirname, "editor");

    // Path to the output folder
    var buildPath = path.resolve(__dirname, "build");

    // Path to the packages storing folder
    var packagesPath = grunt.option("packages")
    if (packagesPath) {
        packagesPath = path.resolve(process.cwd(), packagesPath);
    } else {
        packagesPath = path.resolve(__dirname, "packages");
    }

    // Load grunt modules
    grunt.loadNpmTasks('grunt-hr-builder');
    grunt.loadNpmTasks("grunt-bower-install-simple");
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

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
                "index": grunt.file.read(path.resolve(srcPath, "index.html")),

                // Build output directory
                "build": buildPath,

                // Static files map
                "static": {
                    "fonts": path.resolve(srcPath, "resources/fonts"),
                    "images": path.resolve(srcPath, "resources/images"),
                    "fonts/octicons": path.resolve(srcPath, "vendors/octicons/octicons")
                },

                // Vendors
                "paths": {
                    "sockjs": path.resolve(srcPath, "vendors/bower-sockjs-client/sockjs")
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
            },
            'publish': {
                command: "npm publish",
                cwd: '.tmp/',
                stdout: true,
                stderr: true
            }
        },
        "copy": {
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

                    // Only take "./client/build"
                    "!./editor/**",
                    "./editor/build/**",

                    // Ignore some build time only modules
                    "./node_modules/.bin/**",
                    "!./node_modules/grunt/**",
                    "!./node_modules/grunt-*/**",
                    "!./node_modules/happyrhino/**",

                    // Exclude test directories from node modules
                    "!./node_modules/**/test/**",
                ],

                // Preserve permissions
                options: {
                    mode: true
                }
            }
        },
        "clean": {
            tmp: ['.tmp/']
        }
    });

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

            var stat = null;

            try { stat = fs.lstatSync(to); } catch (e) {};

            if (stat && stat.isSymbolicLink()) {
                fs.unlinkSync(to);
            } else if (fs.existsSync(to)) {
                wrench.rmdirSyncRecursive(to);
            }

            fs.symlinkSync(from, to, 'dir');
        });
    });

    grunt.registerTask('resetPkg', 'Reset a package state', function() {
        var topkg = grunt.option('pkg');
        if (!topkg) {
            grunt.log.error('Need --pkg');
            return false;
        }

        var reset = grunt.option('reset') || "node,bower,build";
        reset = _.compact(reset.split(","));

        var pkgPath = path.resolve(packagesPath, topkg);

        var doReset = {
            'node': [ "node_modules/" ],
            'bower': [ "bower_components/" ],
            'build': [ "pkg-build.js" ]
        };

        grunt.log.writeln("Reseting: "+reset.join(", "));
        _.chain(reset)
        .map(function(r) {
            return doReset[r];
        })
        .flatten()
        .each(function(r) {
            var toRemove = path.resolve(pkgPath, r);

            grunt.log.writeln("Removing ", toRemove);
            try {
                if (r[r.length-1] !== '/') {
                    fs.unlink(toRemove);
                } else {
                    wrench.rmdirSyncRecursive(toRemove);
                }
            } catch (e) {
                grunt.log.warn(e.message || e);
            }
        });
    });

    grunt.registerTask("prepare", 'Prepare client build', [
        'bower-install-simple'
    ]);

    grunt.registerTask('build', 'Build client code', [
        'hr:app'
    ]);

    grunt.registerTask('resetPkgs', 'Reset packages build', [
        'exec:clear_packages_build'
    ]);

    grunt.registerTask('tmp', 'Build tmp directory to publish', [
        'build',
        'clean:tmp',
        'copy:tmp'
    ]);

    grunt.registerTask("publish", 'Publish new version', [
        'tmp',
        'exec:publish',
        'clean:tmp'
    ]);

    grunt.registerTask('default', [
        'prepare',
        'build'
    ]);
};
