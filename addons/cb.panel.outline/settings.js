define([], function() {
    var settings = codebox.require("core/settings");

    // Add settings
    return settings.add({
        'namespace': "outline",
        'title': "Outline",
        'defaults': {
            'separator': "."
        },
        'fields': {
            'separator': {
                'label': 'Tag Parts Separator',
                'type': "text"
            }
        }
    });
});