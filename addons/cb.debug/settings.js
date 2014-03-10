define([], function() {
    var settings = codebox.require("core/settings");

    // Add settings
    return settings.add({
        'namespace': "debug",
        'title': "Debug",
        'defaults': {
            'path': ""
        },
        'fields': {
            'path': {
                'label': 'File Path',
                'type': "text",
                'help': "Click left on a file and select 'debug' to update this file."
            }
        }
    });
});