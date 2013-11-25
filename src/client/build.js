var path = require("path");
var pkg = require("../../package.json");

exports.config = {
    // Base directory for the application
    "base": __dirname,

    // Application name
    "name": "Codebox",

    // Mode debug
    "debug": process.env.CLIENT_DEBUG != null,

    // Main entry point for application
    "main": "main",

    // Build output directory
    "build": path.resolve(__dirname, "build"),

    // Static files mappage
    "static": {
        "templates": path.resolve(__dirname, "resources", "templates"),
        "images": path.resolve(__dirname, "resources", "images"),
        "fonts": path.resolve(__dirname, "resources", "fonts"),
        "require-tools": path.resolve(__dirname, "resources", "require-tools")
    },

    // Stylesheet entry point
    "style": path.resolve(__dirname, "resources/stylesheets/main.less"),

    // Modules paths
    'paths': {
        'moment': 'vendors/moment'
    },
    "shim": {
        'views/views': {
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
        }
    },
    'args': {
        'version': pkg.version
    },
    'options': {
        
    }
};