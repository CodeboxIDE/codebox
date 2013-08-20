// Requires
var Q = require('q');
var path = require('path');
var architect = require('architect');

// The root of our plugins
var pluginPath = path.resolve(
    __dirname, '..', 'lib'
);

// Plugins to load
var plugins = [
    // Core
    "./cb.core",

    // Express server
    "./cb.server",

    // Status endpoint (root)
    "./cb.status",

    // VFS
    "./cb.vfs",
    "./cb.vfs_http",

    // Shells
    "./cb.shells",
    "./cb.shells.stream",

    // Detect project types
    "./cb.projectType",

    // Autorun
    // "./cb.autorun"

    // Socket.io
    "./cb.socket.io",

    // Files
    "./cb.files.service",
    "./cb.files.sync",

    // Now start the damn server
    "./cb.main",
];

// Create app
Q.nfcall(architect.createApp, architect.resolveConfig(plugins, pluginPath))
.then(function(app) {
    console.info('Started CodeBox');
})
.fail(function(err) {

    console.error('Error initializing CodeBox');
    console.error(err);
    console.error(err.stack);

    // Kill process
    process.exit(1);
});