#!/usr/bin/env node


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

    // Event bus
    "./cb.events",
    "./cb.events.log",
    "./cb.events.socketio",

    // Express server
    "./cb.server",

    // Middleware (session, auth, ...)
    "./cb.middleware",

    // Status endpoint (root)
    "./cb.status",

    // RPC
    "./cb.httpRPC",

    // VFS
    "./cb.vfs",
    "./cb.vfs_http",

    // Shells
    "./cb.shells",
    "./cb.shells.rpc",
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

    // Git
    "./cb.git",
    "./cb.git.rpc",

    // Search
    "./cb.search",
    "./cb.search.rpc",

    // Auth
    "./cb.auth.rpc",

    // Users
    "./cb.users.rpc",

    // Watch (file modifications)
    "./cb.watch",

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