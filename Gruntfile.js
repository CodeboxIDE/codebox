var path = require("path");
var pkg = require("./package.json");

module.exports = function (grunt) {
    // Path to the client src
    var srcPath = path.resolve(__dirname, "editor");
    var buildPath = path.resolve(__dirname, "build");

    // Load grunt modules
    grunt.loadNpmTasks('grunt-hr-builder');
    grunt.loadNpmTasks("grunt-bower-install-simple");

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
                "static": {},

                // Stylesheet entry point
                "style": path.resolve(srcPath, "resources/stylesheets/main.less")
            }
        }
    });

    // Build
    grunt.registerTask("prepare", [
        "bower-install-simple"
    ]);
    grunt.registerTask('build', [
        'hr:app'
    ]);

    grunt.registerTask('default', [
        'prepare',
        'build'
    ]);
};
