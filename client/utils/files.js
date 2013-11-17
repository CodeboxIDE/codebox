define([
    'q',
    'underscore',
    'utils/settings',
    'views/files/base'
], function(Q, _, settings) {
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
        || !handler.View) {
            throw "Invalid files handler format";
        }
        console.log("add handler", handlerId);

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
    var getHandler = function(file, defaultHandler) {
        var validHandlers = _.filter(handlers, function(handler) {
            return handler.valid(file);
        });

        if (_.size(validHandlers) == 0) {
            return Q(defaultHandler ? handlers[defaultHandler] : null);
        } else {
            return Q(_.first(validHandlers));
        }
    };

    return {
        'addHandler': addHandler,
        'getHandler': getHandler
    };
});