define([
    'q',
    'underscore',
    'hr/hr',
    'models/file',
    'core/box',
    'utils/settings',
    'utils/dialogs',
    'utils/tabs',
    'views/tabs/file',
    'views/files/base'
], function(Q, _, hr, File, box, settings, dialogs, tabs, FileTab) {
    var logging = hr.Logger.addNamespace("files");

    // Settings for files manager
    var settings = settings.add({
        'namespace': "files",
        'title': "Files",
        'fields': {}
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

        if (handler.View) {
            handler.open = function(file) {
                var path = file.path();
                var manager = tabs.manager();

                var tab = manager.getActiveTabByType("directory");
                if (tab != null && !manager.checkTabExists(path)) {
                    // Change current tab to open the file
                    tab.view.load(path);
                } else {
                    // Add new tab
                    tabs.open(FileTab, {
                        "model": file,
                        "handler": handler
                    }, {
                        "uniqueId": path,
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
            return handler.valid(file);
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

        var handlers = getHandlers(file);
        if (_.size(handlers) == 0) {
            dialogs.alert("No handler for this file", "Sorry, No handler has been found to open this file. Try to find and install an addon to manage this file.");
            return Q.reject(new Error("No handler for this file"));
        }

        // todo: dialog to choose the handler
        var handler = _.first(handlers);
        return Q(handler.open(file));
    };

    return {
        'addHandler': addHandler,
        'getHandlers': getHandlers,
        'open': openFile
    };
});