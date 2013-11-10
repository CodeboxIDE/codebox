// Requires
var Q = require('q');
var _ = require('underscore');

var os = require('os');
var path = require('path');

var engineer = require('engineer');

var start = function(config) {
    // Options
    config = _.defaults({}, config || {}, {
        'root': process.env.WORKSPACE_DIR || process.cwd(),
        'title': process.env.WORKSPACE_NAME || "Workspace",
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
            'settings': process.env.WORKSPACE_HOOK_SETTINGS,

            // Valid addons installation with a hook
            'addons': process.env.WORKSPACE_HOOK_ADDONS
        },
        'webhook': {
            // Token to pass as Authorization header
            'authToken': process.env.WORKSPACE_HOOK_TOKEN
        },
        'addons': {
            // Base path
            'path': process.env.WORKSPACE_ADDONS_DIR || path.resolve(__dirname + '/../.addons'),
            'defaultsPath': process.env.WORKSPACE_ADDONS_DEFAULTS_DIR || path.resolve(__dirname + '/../addons'),
            'tempPath': process.env.WORKSPACE_ADDONS_TEMP_DIR || os.tmpDir()
        }
    });

    // Normalize root path
    config.root = path.resolve(process.cwd(), config.root);

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

        // Addons
        {
            // Path to plugin
            'packagePath': "./cb.addons",

            // Options
            'path': config.addons.path,
            'tempPath': config.addons.tempPath,
            'defaultsPath': config.addons.defaultsPath
        },

        // Express server
        "./cb.server",

        // VFS
        "./cb.vfs",
        "./cb.vfs.http",

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

    var app = new engineer.Application({
        'paths': [pluginPath]
    });
    app.on("error", function(err) {
        console.log("Error in the application:");
        console.log(err.stack);
    });
    return app.load(plugins).then(function() {
        return Q(app);
    });
};

module.exports = {
    'start': start
};