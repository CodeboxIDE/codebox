define([], function() {
    var settings = codebox.require("core/settings");

    // Add settings
    return settings.add({
        'namespace': "offline",
        'title': "Offline",
        'defaults': {
            'enabled': false,
            'syncInterval': 10
        },
        'fields': {
            'enabled': {
                'label': 'Enable Files Synchronization',
                'type': "checkbox"
            },
            'syncInterval': {
                'label': "Synchronization (minutes)",
                'type': "number",
                'min':  1,
                'max': 1000,
                'step': 1
            },
            'syncIgnore': {
                'label': "Ignored files (one by line)",
                'type': "textarea"
            }
        }
    });
});