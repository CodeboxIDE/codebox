define([
    'q',
    'underscore',
    'hr/hr',
    'models/file',
    'collections/files',
    'core/user',
    'core/box',
    'core/tabs',
    'core/settings',
    'core/search',
    'utils/dialogs',
    'views/tabs/file',
    'views/files/base'
], function(Q, _, hr, File, Files, user, box, tabs, settings, search, dialogs, FileTab) {
    var logging = hr.Logger.addNamespace("files");

    // Settings for files manager
    var settings = settings.add({
        'namespace': "files",
        'title': "Files",
        'fields': {}
    });
    var userSettings = user.settings("files");

    // Recent files
    var recentFiles = new Files();
    recentFiles.on("add", function() {
        // Limit collection size
        if (recentFiles.size() > 20) recentFiles.shift();
    });

    // Files handlers map
    var handlers = {};

    // Add handler
    var addHandler = function(handlerId, handler) {
        if (!handler
        || !handlerId
        || !handler.name
        || !handler.valid
        || (!handler.View && !handler.open)) {
            throw "Invalid files handler format";
        }

        handler.id = handlerId;

        if (handler.View) {
            handler.open = function(file) {
                var path = file.path();
                var uniqueId = handler.id+":"+file.syncEnvId();

                var tab = tabs.getActiveTabByType("directory");
                if (tab != null && !tabs.checkTabExists(uniqueId) && !file.isNewfile()) {
                    // Change current tab to open the file
                    tab.view.load(path, handler);
                } else {
                    // Add new tab
                    var tab = tabs.add(FileTab, {
                        "model": file,
                        "handler": handler
                    }, {
                        "uniqueId": uniqueId,
                        "type": "file",
                    });
                    tab.on("tab:state", function(state) {
                        if (state) box.setActiveFile(file);
                    });
                }
            };
        }

        // Add settings
        settings.setField(handlerId, {
            'label': handler.name,
            'type': "checkbox",
            'default': true
        });

        // Register handler
        handlers[handlerId] = handler;
    };

    // Get handler for a file
    var getHandlers = function(file, defaultHandler) {
        return _.filter(handlers, function(handler) {
            return userSettings.get(handler.id, true) && handler.valid(file);
        });
    };

    // get fallback handlers for a file
    var getFallbacks = function(file) {
        return _.filter(handlers, function(handler) {
            return userSettings.get(handler.id, true) && handler.fallback == true;
        });
    };

    // Open file with handler
    var openFileHandler = function(handler, file) {
        // Add to recent files
        if (!file.isNewfile()) recentFiles.add(file);

        // Open
        box.setActiveFile(file);
        return handler.open(file);
    }

    // Select to open a file with any handler
    var openFileWith = function(file) {
        var choices = {};
        _.each(handlers, function(handler) {
            choices[handler.id] = handler.name;
        });

        if (_.size(choices) == 0) {
            return Q.reject(new Error("No handlers for this file"));
        }

        return dialogs.select("Can't open this file", "Sorry, No handler has been found to open this file. Try to find and install an add-on to manage this file or select one of the following handlers:", choices).then(function(value) {
            var handler = handlers[value];
            return Q(openFileHandler(handler, file));
        });
    };

    // Open a file
    var openFile = function(file, options) {
        options = _.defaults({}, options || {}, {
            'userChoice': null,
            'useFallback': true
        });

        if (_.isString(file)) {
            var nfile = new File({
                'codebox': box
            });
            return nfile.getByPath(file).then(function() {
                return openFile(nfile);
            });
        }

        var possibleHandlers = getHandlers(file);

        // get fallbacks
        if (_.size(possibleHandlers) == 0 && options.useFallback) {
            possibleHandlers = getFallbacks();
        }

        // All choices
        if (_.size(possibleHandlers) == 0) {
            return openFileWith(file);
        }

        if (_.size(possibleHandlers) == 1 && (options.userChoice != true)) {
            return Q(openFileHandler(_.first(possibleHandlers), file));
        }

        var choices = {};
        _.each(possibleHandlers, function(handler) {
            choices[handler.id] = handler.name;
        })

        if (_.size(choices) == 0) {
            return Q.reject(new Error("No handlers for this file"));
        }

        return dialogs.select("Open with...", "Select one of the following handlers to open this file:", choices).then(function(value) {
            var handler = handlers[value];
            return Q(openFileHandler(handler, file));
        });
    };

    // Open a new file
    var openNew = function(name) {
        name = name || "untitled";

        // Create a temporary file
        var f = new File({
            'codebox': box
        }, {
            'name': name,
            'size': 0,
            'mtime': 0,
            'mime': "text/plain",
            'href': location.protocol+"//"+location.host+"/vfs/"+name,
            'exists': false
        });
        return openFile(f);
    };

    // Search for files
    search.handler({
        'id': "files",
        'title': "Files"
    }, function(query) {
        return box.searchFiles(query).then(function(data) {
            return Q(_.map(data.files, _.bind(function(path) {
                var filename = _.last(path.split("/"));
                if (filename.length == 0) filename = path;
                return {
                    "text": filename,
                    "callback": _.bind(function() {
                        openFile(path);
                    }, this)
                };
            }, this)));
        });
    });

    return {
        'addHandler': addHandler,
        'getHandlers': getHandlers,
        'open': openFile,
        'openNew': openNew,
        'recent': recentFiles
    };
});