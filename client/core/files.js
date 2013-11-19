define([
    'q',
    'underscore',
    'hr/hr',
    'models/file',
    'core/user',
    'core/box',
    'core/settings',
    'utils/dialogs',
    'utils/tabs',
    'views/tabs/file',
    'views/files/base'
], function(Q, _, hr, File, user, box, settings, dialogs, tabs, FileTab) {
    var logging = hr.Logger.addNamespace("files");

    // Settings for files manager
    var settings = settings.add({
        'namespace': "files",
        'title': "Files",
        'fields': {}
    });
    var userSettings = user.settings("files");

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
                var manager = tabs.manager();
                var uniqueId = handler.id+":"+path;

                var tab = manager.getActiveTabByType("directory");
                if (tab != null && !manager.checkTabExists(uniqueId)) {
                    // Change current tab to open the file
                    tab.view.load(path, handler);
                } else {
                    // Add new tab
                    tabs.open(FileTab, {
                        "model": file,
                        "handler": handler
                    }, {
                        "uniqueId": uniqueId,
                        "type": "file",
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

    // Select to open a file with any handler
    var openFileWith = function(file) {
        var choices = {};
        _.each(handlers, function(handler) {
            choices[handler.id] = handler.name;
        });
        return dialogs.select("Can't open this file", "Sorry, No handler has been found to open this file. Try to find and install an add-on to manage this file or select one of the following handlers:", choices).then(function(value) {
            var handler = handlers[value];
            return Q(handler.open(file));
        });
    };

    // Open a file
    var openFile = function(file) {
        if (_.isString(file)) {
            var nfile = new File({
                'codebox': box
            });
            return nfile.getByPath(file).then(function() {
                return openFile(nfile);
            });
        }

        var possibleHandlers = getHandlers(file);
        if (_.size(possibleHandlers) == 0) {
            return openFileWith(file);
        }

        if (_.size(possibleHandlers) == 1) {
            return Q(_.first(possibleHandlers).open(file));
        }

        var choices = {};
        _.each(possibleHandlers, function(handler) {
            choices[handler.id] = handler.name;
        })
        return dialogs.select("Open with...", "Select one of the following handlers to open this file:", choices).then(function(value) {
            var handler = handlers[value];
            return Q(handler.open(file));
        });
    };

    return {
        'addHandler': addHandler,
        'getHandlers': getHandlers,
        'open': openFile
    };
});