// Requires
var Q = require('q');
var _ = require('underscore');

var urils = require('./utils');
var os = require('os');
var path = require('path');
var Gittle = require('gittle');
var engineer = require('engineer');

var start = function(config) {
    var codeboxGitRepo = new Gittle(path.resolve(__dirname, ".."));
    var prepare = Q();

    // Options
    config = _.deepExtend({
        'root': process.env.WORKSPACE_DIR || process.cwd(),
        'title': process.env.WORKSPACE_NAME,
        'public': process.env.WORKSPACE_PUBLIC != "false",
        'dev': process.env.DEV != null,
        'workspace': {
            'id': null
        },
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
            'tempPath': process.env.WORKSPACE_ADDONS_TEMP_DIR || os.tmpDir(),
            'blacklist': (process.env.WORKSPACE_ADDONS_BLACKLIST || "").split(",")
        },
        'users': {
            // Max number of collaborators
            'max': parseInt(process.env.WORKSPACE_USERS_MAX || 100),

            // Default auth email
            'defaultEmail': null,
            'defaultToken': null,

            // Use git for auth
            'gitDefault': true
        },
        'proc': {
            'urlPattern': process.env.WORKSPACE_WEB_URL_PATTERN || 'http://localhost:%d'
        },
        'server': {
            'port': parseInt(process.env.PORT || 8000, 10)
        }
    }, config || {});

    // Normalize root path
    config.root = path.resolve(process.cwd(), config.root);

    // Default title
    if (config.title == null) {
        config.title = path.basename(config.root)
    }

    // Is dev mode
    if (config.dev) {
        console.log("WARNING! your codebox is in dev mode");
    }

    // Use git for auth
    if (config.users.gitDefault && !config.users.email) {
        // get GIT settings for defining default user
        prepare = prepare.then(function() {
            return codeboxGitRepo.identity().then(function(actor) {
                console.log("Use GIT actor for auth: ", actor.email);
                _.extend(config, {
                    'users': {
                        'defaultEmail': actor.email
                    }
                });
            });
        });
    }

    // The root of our plugins
    var pluginPath = path.resolve(
        __dirname
    );

    var app = new engineer.Application({
        'paths': [pluginPath]
    });
    app.on("error", function(err) {
        console.log("Error in the application:");
        console.log(err.stack);
    });
    return prepare.fin(function() {
        // Plugins to load
        var plugins = [
            // Core
            {
                // Path to plugin
                'packagePath': "./cb.core",

                // Options
                'id': config.workspace.id,
                'title': config.title,
                'root': config.root,
                'public': config.public,
                'maxUsers': config.users.max
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
                'dev': config.dev,
                'path': config.addons.path,
                'tempPath': config.addons.tempPath,
                'defaultsPath': config.addons.defaultsPath,
                'blacklist': config.addons.blacklist
            },

            // Express server
            {
                packagePath: "./cb.server",

                'dev': config.dev,
                'port': config.server.port,
                'defaultEmail': config.users.defaultEmail,
                'defaultToken': config.users.defaultToken
            },

            // VFS
            "./cb.vfs",
            "./cb.vfs.http",

            // Shells
            "./cb.shells",
            "./cb.shells.stream",

            // Detect project types
            "./cb.project.detect",

            // Running code/projects
            {
                packagePath: "./cb.run.ports",

                // These are optional, harbor has sane defaults
                min: process.env.RUN_PORTS_MIN,
                max: process.env.RUN_PORTS_MAX,
            },
            "./cb.run.file",

            {
                packagePath: "./cb.run.project",
                
                urlPattern: config.proc.urlPattern
            },

            // Socket.io
            "./cb.socket.io",

            // Files
            "./cb.files.service",
            "./cb.files.sync",

            // Git
            "./cb.git",

            // Export
            "./cb.export",

            // Offline manifest
            {
                packagePath: "./cb.offline",
                
                dev: config.dev
            },

            // Search
            "./cb.search",

            // Proxy
            "./cb.proxy.http",

            // Watch (file modifications)
            "./cb.watch",

            // Manages processes
            {
                packagePath: "./cb.proc",

                urlPattern: config.proc.urlPattern
            },

            // APIs
            "./cb.rpc",
            "./cb.rpc.users",
            "./cb.rpc.box",
            "./cb.rpc.shells",
            "./cb.rpc.git",
            "./cb.rpc.auth",
            "./cb.rpc.search",
            "./cb.rpc.addons",
            "./cb.rpc.proc",
            "./cb.rpc.run",

            // Now start the damn server
            "./cb.main",
        ];
        return app.load(plugins); 
    }).then(function() {
        return Q(app);
    });
};

module.exports = {
    'start': start
};