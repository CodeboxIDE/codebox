define([
    'hr/promise',
    'hr/utils',
    'hr/hr',
    'models/file',
    'collections/files',
    'core/user',
    'core/box',
    'core/tabs',
    'core/settings',
    'utils/dialogs',
    'views/tabs/file',
    'views/files/base',
    'views/files/tab'
], function(Q, _, hr, File, Files, user, box, tabs, settings, dialogs, FileTab) {
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

    // Active files
    var activeFiles = new Files();

    // Files handlers map
    var handlers = {};

    // Restorer for tabs
    tabs.addRestorer("file", function(tabInfos) {
        var parts = tabInfos.id.split(":");
        var handlerId = parts[0];
        var path = parts.slice(1).join(":");

        var newFile = path.indexOf("temporary") == 0;
        if (!newFile) {
            return openFile(path.replace("file://", ""))
            .then(function() {
                return tabs.getById(tabInfos.id);
            });
        }

        return null;
    });

    // Add handler
    var addHandler = function(handlerId, handler) {
        if (!handler
        || !handlerId
        || !handler.name
        || !handler.valid
        || (!handler.View && !handler.open)) {
            throw "Invalid files handler format";
        }

        handler = _.defaults(handler, {
            // Mark this file as active when open with
            'setActive': false,

            // Fallback when no correct handler
            'fallback': false,

            // Priority of this handler
            'position': 10
        });

        handler.id = handlerId;

        if (handler.View) {
            handler.open = function(file, fileOptions) {
                var path = file.path();
                var uniqueId = handler.id+":"+file.syncEnvId();

                // Add files as open
                if (handler.setActive) activeFiles.add(file);

                // Add new tab
                var tab = tabs.add(FileTab, {
                    "model": file,
                    "handler": handler,
                    'fileOptions': fileOptions
                }, {
                    "uniqueId": uniqueId,
                    "type": "file",
                });

                // Focus tab -> set active file
                tab.on("tab:state", function(state) {
                    if (state) box.setActiveFile(file);
                });

                // Close tab -> close active file
                tab.on("tab:close", function(state) {
                    if (handler.setActive) activeFiles.remove(file);
                });

                tab.setFileOptions(fileOptions);
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

        return handlers[handlerId];
    };

    // Get handler for a file
    var getHandlers = function(file) {
        return _.chain(handlers)
        .filter(function(handler) {
            return userSettings.get(handler.id, true) && handler.valid(file);
        })
        .sortBy(function(handler) {
            return handler.position || 10;
        })
        .value();
    };

    // get fallback handlers for a file
    var getFallbacks = function(file) {
        return _.filter(handlers, function(handler) {
            return userSettings.get(handler.id, true) && handler.fallback == true;
        });
    };

    // Open file with handler
    var openFileHandler = function(handler, file, fileOptions) {
        // Add to recent files
        if (!file.isNewfile()) recentFiles.add(file);

        // Options for the file handler
        fileOptions = _.defaults(fileOptions || {}, {
            line: null,
            pattern: null
        });

        return Q(handler.open(file, fileOptions)).then(function() {
            box.setActiveFile(file);
        });
    };

    // Select to open a file with any handler
    var openFileWith = function(file, fileOptions) {
        var choices = {};
        _.each(handlers, function(handler) {
            choices[handler.id] = handler.name;
        });

        if (_.size(choices) == 0) {
            return Q.reject(new Error("No handlers for this file"));
        }

        return dialogs.select("Can't open this file", "Sorry, No handler has been found to open this file. Try to find and install an add-on to manage this file or select one of the following handlers:", choices).then(function(value) {
            var handler = handlers[value];
            return Q(openFileHandler(handler, file, fileOptions));
        });
    };

    // Open a file
    var openFile = function(file, options) {
        options = _.defaults({}, options || {}, {
            'userChoice': null,
            'useFallback': true,
            'line': null
        });

        // Options for the file handler
        var fileOptions = _.pick(options, ["line", "pattern"]);

        if (_.isString(file)) {
            var nfile = new File({
                'codebox': box
            });
            return nfile.getByPath(file).then(function() {
                return openFile(nfile, options);
            });
        }

        var possibleHandlers = getHandlers(file);

        // Get fallbacks
        if (_.size(possibleHandlers) == 0 && options.useFallback) {
            possibleHandlers = getFallbacks();
        }

        // All choices
        if (_.size(possibleHandlers) == 0) {
            return openFileWith(file, fileOptions);
        }

        if (_.size(possibleHandlers) == 1 || (options.userChoice != true)) {
            return Q(openFileHandler(_.first(possibleHandlers), file, fileOptions));
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
            return Q(openFileHandler(handler, file, fileOptions));
        });
    };

    // Open a new file
    var openNew = function(name, content, options) {
        name = name || "untitled";

        // Create a temporary file
        var f = new File({
            'newFileContent': content || "",
            'codebox': box
        }, {
            'name': name,
            'size': 0,
            'mtime': 0,
            'mime': "text/plain",
            'href': location.protocol+"//"+location.host+"/vfs/"+name,
            'exists': false
        });

        return openFile(f, options);
    };

    return {
        'addHandler': addHandler,
        'getHandlers': getHandlers,
        'open': openFile,
        'openNew': openNew,
        'recent': recentFiles,
        'active': activeFiles
    };
});