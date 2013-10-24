// Requires
var _ = require('underscore');
var Q = require('q');
var path = require('path');
var architect = require('architect');

var start = function(config) {
    // Options
    config = _.defaults({}, config || {}, {
        'root': process.env.WORKSPACE_DIR || process.cwd(),
        'title': process.env.WORKSPACE_NAME,
        'hooks': {
            // Hooks could be:
            //  - string: considered as url
            //  - function: fucntion is called
            //  - null: default behavior


            // Auth: send auth infos and get status and user settings
            'auth': process.env.WORKSPACE_HOOK_AUTH,

            // Events: send events to a hook
            'events': process.env.WORKSPACE_HOOK_EVENTS,

            // Settings: send user settings to a hook
            'settings': null
        },
        'webhook': {
            // Token to pass as Authorization header
            'authToken': process.env.WORKSPACE_HOOK_TOKEN
        }
    });

    // Normalize root path
    config.root = path.join(process.cwd(), config.root);

    // Default title
    if (config.title == null) {
        config.title = path.basename(config.root)
    }

    // The root of our plugins
    var pluginPath = path.resolve(
        __dirname
    );

    // Plugins to load
    var plugins = [
        // Core
        {
            // Path to plugin
            'packagePath': "./cb.core",

            // Options
            'title': config.title,
            'root': config.root
        },

        // Utils
        "./cb.logger",
        {
            // Path to plugin
            'packagePath': "./cb.hooks",

            // Options
            'hooks': config.hooks,
            'webAuthToken': config.webhook.authToken
        },

        // Event bus
        "./cb.events",
        "./cb.events.log",
        "./cb.events.socketio",
        "./cb.events.webhook",

        // Express server
        "./cb.server",

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
        "./cb.rpc.addons",

        // Now start the damn server
        "./cb.main",
    ];

    // Create app
    return Q.nfcall(architect.createApp, architect.resolveConfig(plugins, pluginPath));
};

module.exports = {
    'start': start
};