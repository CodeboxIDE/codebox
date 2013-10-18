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
    {
        // Path to plugin
        packagePath: "./cb.core",

        // Options
        root: process.env.WORKSPACE_DIR
    },

    // Utils
    "./cb.logger",

    // Event bus
    "./cb.events",
    "./cb.events.log",
    "./cb.events.socketio",
    {
        // Path to plugin
        packagePath: "./cb.events.webhook",

        // Options
        url: process.env.WEBHOOK_URL,
        timeout: process.env.WEBHOOK_TIMEOUT,
    },

    // Express server
    {
        packagePath: "./cb.server",

        disableAuth: process.env.DISABLE_AUTH == "true",
    },

    // VFS
    "./cb.vfs",
    "./cb.vfs_http",

    // Shells
    "./cb.shells",
    "./cb.shells.stream",

    // Detect project types
    "./cb.projectType",

    // Socket.io
    "./cb.socket.io",

    // Files
    "./cb.files.service",
    "./cb.files.sync",

    // Git
    "./cb.git",

    // Search
    "./cb.search",

    // Proxy
    "./cb.proxy.http",

    // Watch (file modifications)
    "./cb.watch",

    // APIs
    "./cb.rpc",
    "./cb.rpc.users",
    "./cb.rpc.box",
    "./cb.rpc.shells",
    "./cb.rpc.git",
    "./cb.rpc.auth",
    "./cb.rpc.search",

    // Now start the damn server
    "./cb.main",
];

// Create app
Q.nfcall(architect.createApp, architect.resolveConfig(plugins, pluginPath))
.fail(function(err) {

    console.error('Error initializing CodeBox');
    console.error(err);
    console.error(err.stack);

    // Kill process
    process.exit(1);
});